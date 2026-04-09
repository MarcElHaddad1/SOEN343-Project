import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const defaultPath = user?.role === "admin" ? "/admin" : user?.role === "provider" ? "/provider" : "/search";

  if (loading) return <div className="container">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={defaultPath} replace />;

  return children;
}
