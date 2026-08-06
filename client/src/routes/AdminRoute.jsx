import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loader from "../components/loader/Loader";

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Loading admin dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default AdminRoute;