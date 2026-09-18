import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home, Services, Contact } from "./pages/PublicPages";
import { Login, Register } from "./pages/AuthPages";
import { Booking } from "./pages/Booking";
import { MyBookings } from "./pages/MyBookings";
import { AdminShell } from "./admin/AdminPages";

export default function App() { return <BrowserRouter><AuthProvider><Routes><Route element={<Layout />}><Route path="/" element={<Home />} /><Route path="/services" element={<Services />} /><Route path="/contact" element={<Contact />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route element={<ProtectedRoute />}><Route path="/booking" element={<Booking />} /><Route path="/my-bookings" element={<MyBookings />} /></Route><Route element={<ProtectedRoute admin />}><Route path="/admin" element={<AdminShell />} /><Route path="/admin/bookings" element={<AdminShell />} /><Route path="/admin/services" element={<AdminShell />} /><Route path="/admin/working-hours" element={<AdminShell />} /><Route path="/admin/holidays" element={<AdminShell />} /><Route path="/admin/settings" element={<AdminShell />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes></AuthProvider></BrowserRouter>; }
