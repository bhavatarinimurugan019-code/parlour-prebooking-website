import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { watchUserBookings } from "../utils/bookingUtils";
import { formatTime } from "../utils/timeUtils";

export function MyBookings() { const { user } = useAuth(); const [items, setItems] = useState([]); useEffect(() => watchUserBookings(user.uid, setItems), [user.uid]); return <section className="section page"><p className="eyebrow">YOUR APPOINTMENTS</p><h1>My bookings.</h1><p className="lead narrow">Everything you have planned with us, in one place.</p><div className="booking-list">{items.map(item => <article className="booking-card" key={item.id}><div><p className="eyebrow">{item.status}</p><h2>{item.serviceName}</h2><p>{item.date} · {formatTime(item.startTime)}–{formatTime(item.endTime)}</p></div><strong>₹{item.price}</strong></article>)}{!items.length && <div className="empty-state">No bookings yet. Your next appointment can start here.</div>}</div></section>; }
