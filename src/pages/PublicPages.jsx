import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { listServices, watchActiveServices } from "../utils/bookingUtils";

export function Home() {
  const [services, setServices] = useState([]);
  useEffect(() => { listServices().then(items => setServices(items.filter(item => item.active))).catch(() => {}); }, []);
  return <div><section className="hero"><div><p className="eyebrow">THE EVERYDAY RITUAL</p><h1>Beauty care with a quieter kind of luxury.</h1><p className="lead">Personalised hair, skin, nail and bridal services in a considered studio made for feeling like yourself.</p><div className="actions"><Link className="button" to="/booking">Book an appointment</Link><Link className="button secondary" to="/services">Explore services</Link></div></div><div className="hero-image" /></section><section className="section split"><div><p className="eyebrow">A LITTLE ABOUT US</p><h2>Unhurried care, beautifully done.</h2></div><p>From a precise cut to a full bridal morning, our team makes space for the details that make an appointment feel personal. Choose a service, find a time, and let us take care of the rest.</p></section><section className="section tinted"><div className="section-heading"><p className="eyebrow">POPULAR SERVICES</p><h2>Choose your next ritual</h2></div><div className="card-grid">{services.slice(0, 3).map(service => <article className="service-card" key={service.id}><p className="eyebrow">{service.category}</p><h3>{service.name}</h3><p>{service.description || "A considered service delivered by our professional team."}</p><strong>₹{service.price} · {service.duration} min</strong></article>)}</div></section><section className="section process"><p className="eyebrow">SIMPLE BY DESIGN</p><h2>Pick a service. Find a time. Arrive ready.</h2><div className="steps"><span><b>01</b> Choose your service</span><span><b>02</b> Reserve a clear slot</span><span><b>03</b> Enjoy your appointment</span></div></section></div>;
}

export function Services() {
  const [services, setServices] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => watchActiveServices(items => { setServices(items); setLoading(false); }), []);
  return <section className="section page"><p className="eyebrow">THE MENU</p><h1>Services for every kind of day.</h1><p className="lead narrow">Transparent pricing, thoughtful timing, and a team that listens first.</p>{loading ? <div className="loading-state">Loading services...</div> : <div className="card-grid">{services.map(service => <article className="service-card" key={service.id}><p className="eyebrow">{service.category}</p><h2>{service.name}</h2><p>{service.description}</p><div className="service-meta"><strong>₹{service.price}</strong><span>{service.duration} min</span></div></article>)}</div>}{!loading && !services.length && <div className="empty-state">No services are available yet.</div>}</section>;
}

export function Contact() { return <section className="section page"><p className="eyebrow">COME BY</p><h1>Make a little room for yourself.</h1><div className="contact-grid"><div><h2>Visit the studio</h2><p>Kiruthis Parlour<br />Chennai, Tamil Nadu</p></div><div><h2>Get in touch</h2><p>Call us for appointments and bridal consultations.<br />+91 98765 43210</p></div></div></section>; }
