import axios from "axios";
import { API_BASE_URL } from "../config/http";

export const logoutUser = async () => {
  try {
    await axios.post(
      `${API_BASE_URL}/auth/logout`,
      {},
      {
        withCredentials: true, // 🔥 required for cookie
      }
    );
  } catch (error) {
    console.log("Logout API error:", error);
  }

  // ✅ clear frontend data
  localStorage.removeItem("token");
  localStorage.removeItem("loggedInUser");
};