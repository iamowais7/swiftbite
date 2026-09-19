import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppData } from "../context/AppContext";

const ProtectedRoute = () => {
  const { isAuth, user, loading } = useAppData();
  const location = useLocation();

  // Wait until fetchUser completes
  if (loading) return null;

  // Not logged in → send to login, remembering where they wanted to go
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but no role yet → must pick a role first
  if (!user?.role && location.pathname !== "/select-role") {
    return <Navigate to="/select-role" replace />;
  }

  // Already has a role → don't let them visit select-role again
  // if (user?.role && location.pathname === "/select-role") {
  //   return <Navigate to="/" replace />;
  // }

  // All good — render the requested page
  return <Outlet />;
};

export default ProtectedRoute;
