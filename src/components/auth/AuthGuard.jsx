import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AuthGuard() {
  const location = useLocation();
  const savedUser = localStorage.getItem("trackit_user");

  if (!savedUser) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  return <Outlet />;
}
