import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("access_token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) return <Navigate to="/error/401" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/error/401" replace />;
  }

  return children;
}
