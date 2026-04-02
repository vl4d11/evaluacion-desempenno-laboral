import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuth } = useAuth();
  const location = useLocation();
  if (!isAuth) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return <Outlet />
}
