import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loading } from "../components/Feedback";

/**
 * Guards a set of routes:
 * - Redirects to /login if not authenticated.
 * - Redirects to the user's own dashboard if their role isn't allowed here
 *   (this is the frontend mirror of the backend's `authorize()` middleware —
 *   the backend still enforces this for real, this just keeps the UI honest).
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, initializing, homeRouteFor } = useAuth();
  const location = useLocation();

  if (initializing) return <Loading label="Checking your session..." />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={homeRouteFor(user.role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
