import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  where,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase/config";
import { fromMinutes, getDayName, isPastSlot, toMinutes } from "./timeUtils";

const bookings = collection(db, "bookings");
const services = collection(db, "services");

export function watchActiveServices(callback) {
  return onSnapshot(query(services, where("active", "==", true)), snapshot => {
    callback(snapshot.docs.map(item => ({ id: item.id, ...item.data() })));
  });
}

export async function listServices() {
  const snapshot = await getDocs(query(services, orderBy("createdAt", "desc")));
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
}

export async function createService(data) {
  return addDoc(services, { ...data, active: true, createdAt: Timestamp.now() });
}

export async function updateService(id, data) {
  return runTransaction(db, transaction => {
    transaction.update(doc(db, "services", id), data);
  });
}

export async function listBookings() {
  const snapshot = await getDocs(query(bookings, orderBy("createdAt", "desc")));
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
}

export function watchUserBookings(uid, callback) {
  return onSnapshot(query(bookings, where("customerId", "==", uid), orderBy("date", "asc")), snapshot => {
    callback(snapshot.docs.map(item => ({ id: item.id, ...item.data() })));
  });
}

export async function getAvailability(date, service) {
  const dayDoc = await getDoc(doc(db, "workingHours", getDayName(date)));
  const holidaySnapshot = await getDocs(query(collection(db, "holidays"), where("date", "==", date)));
  const existingSnapshot = await getDocs(query(bookings, where("date", "==", date), where("status", "in", ["pending", "confirmed"])));
  const hours = dayDoc.exists() ? dayDoc.data() : { isOpen: false };
  const existing = existingSnapshot.docs.map(item => item.data());
  const holiday = !holidaySnapshot.empty;

  if (!hours.isOpen || holiday) return [];

  const duration = Number(service.duration);
  const open = toMinutes(hours.openTime);
  const close = toMinutes(hours.closeTime);
  const slots = [];

  for (let start = open; start + duration <= close; start += 30) {
    const end = start + duration;
    const overlap = existing.some(item => toMinutes(item.startTime) < end && toMinutes(item.endTime) > start);
    if (!overlap && !isPastSlot(date, fromMinutes(start))) slots.push({ startTime: fromMinutes(start), endTime: fromMinutes(end) });
  }

  return slots;
}

export async function createBooking({ service, date, startTime, customer }) {
  const endTime = fromMinutes(toMinutes(startTime) + Number(service.duration));
  const bookingRef = doc(bookings);

  await runTransaction(db, async transaction => {
    const dayRef = doc(db, "workingHours", getDayName(date));
    const holidayQuery = query(collection(db, "holidays"), where("date", "==", date));
    const bookingsQuery = query(bookings, where("date", "==", date), where("status", "in", ["pending", "confirmed"]));
    const [daySnapshot, holidaySnapshot, existingSnapshot] = await Promise.all([
      transaction.get(dayRef),
      transaction.get(holidayQuery),
      transaction.get(bookingsQuery)
    ]);

    if (!daySnapshot.exists() || !daySnapshot.data().isOpen) throw new Error("This day is closed.");
    if (!holidaySnapshot.empty) throw new Error("This date is a holiday.");

    const hours = daySnapshot.data();
    const start = toMinutes(startTime);
    const end = toMinutes(endTime);
    if (start < toMinutes(hours.openTime) || end > toMinutes(hours.closeTime)) throw new Error("This appointment is outside working hours.");

    const overlap = existingSnapshot.docs.some(item => {
      const booking = item.data();
      return toMinutes(booking.startTime) < end && toMinutes(booking.endTime) > start;
    });
    if (overlap) throw new Error("That time was just booked. Please choose another slot.");

    transaction.set(bookingRef, {
      bookingId: bookingRef.id,
      customerId: customer.uid,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      serviceId: service.id,
      serviceName: service.name,
      price: Number(service.price),
      duration: Number(service.duration),
      date,
      startTime,
      endTime,
      status: "pending",
      createdAt: Timestamp.now()
    });
  });

  return bookingRef.id;
}
