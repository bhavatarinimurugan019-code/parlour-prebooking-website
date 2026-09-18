import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { user, profile, logout } = useAuth();
  return <>
    <header className="site-header"><Link className="brand" to="/">Kiruthis <span>Parlour</span></Link><nav>
      <NavLink to="/services">Services</NavLink><NavLink to="/booking">Book appointment</NavLink>{user && <NavLink to="/my-bookings">My bookings</NavLink>}{profile?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}{user ? <button className="link-button" onClick={logout}>Log out</button> : <NavLink to="/login">Log in</NavLink>}
    </nav></header>
    <main><Outlet /></main>
    <footer><div><strong>Kiruthis Parlour</strong><p>Thoughtful beauty care, tailored to your day.</p></div><p>Appointments by reservation · Chennai</p></footer>
  </>;
}
