import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
  import Loader from "../components/loader/Loader";

function ProtectedRoute({children}) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader message="Checking your account..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;