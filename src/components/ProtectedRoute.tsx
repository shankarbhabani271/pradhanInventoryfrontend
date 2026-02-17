import type { Rootstate } from "@/store/store";
import type React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = useSelector(
    (state: Rootstate) => state.auth.isAuthenticated
  );

  return isAuth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
