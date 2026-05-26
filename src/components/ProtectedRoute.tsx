import { Navigate } from "react-router-dom";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ❌ no token
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ❌ unauthorized role
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    // Redirect to their default dashboard
    if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
    if (role === "manager") return <Navigate to="/manager-dashboard" replace />;
    if (role === "procurement") return <Navigate to="/procurement-dashboard" replace />;
    if (role === "inventory") return <Navigate to="/inventory-dashboard" replace />;
    return <Navigate to="/employee-dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;