import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
