import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ admin = false }) {
  const { user, profile, loading, configured } = useAuth();
  const location = useLocation();
  if (!configured) return <div className="config-state"><h1>Firebase setup required</h1><p>Add the VITE_FIREBASE_* values from .env.example, then reload the app.</p></div>;
  if (loading) return <div className="loading-state">Checking your account...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (admin && profile?.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}
