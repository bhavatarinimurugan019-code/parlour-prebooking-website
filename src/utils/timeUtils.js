export function toMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function fromMinutes(value) {
  const hours = Math.floor(value / 60);
  const minutes = String(value % 60).padStart(2, "0");
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

export function formatTime(value) {
  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function getDayName(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long" });
}

export function isPastSlot(date, time) {
  return new Date(`${date}T${time}:00`).getTime() <= Date.now();
}
