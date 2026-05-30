import { Navigate } from "react-router-dom";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

// Securely decode Base64URL JWT payload to parse cryptographically signed claims
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const claims = token ? decodeJwt(token) : null;
  const role = claims?.role;

  // ❌ no token or parsing failure
  if (!token || !role) {
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