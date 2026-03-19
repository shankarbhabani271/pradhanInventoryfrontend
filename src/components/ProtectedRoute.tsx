import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { Rootstate } from "@/store/store";

const TEN_MIN = 10 * 60 * 1000;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useSelector((state: Rootstate) => state.auth.token);

  const loginTime = localStorage.getItem("loginTime");

  // ❌ no token
  if (!token || !loginTime) {
    return <Navigate to="/login" replace />;
  }

  const diff = Date.now() - Number(loginTime);

  // ❌ expired
  if (diff > TEN_MIN) {
    localStorage.removeItem("token");
    localStorage.removeItem("loginTime");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;