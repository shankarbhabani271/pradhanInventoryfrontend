import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/authSlice";
import AppRouter from "./AppRouter";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      dispatch(loginSuccess(token));
    }
  }, [dispatch]);

  return <AppRouter />;
};

export default App; // ✅ MUST BE HERE