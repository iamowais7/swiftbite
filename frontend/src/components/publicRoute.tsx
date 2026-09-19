import { useAppData } from "../context/AppContext"
import { Navigate, Outlet, useLocation } from "react-router-dom";

const PublicRoute = () => {
  const { isAuth, loading } = useAppData();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  if (loading) return null;
  return isAuth ? <Navigate to={from} replace /> : <Outlet />;
}

export default PublicRoute;
