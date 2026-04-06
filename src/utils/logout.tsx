import axios from "axios";

export const logoutUser = async () => {
  try {
    await axios.post(
      "http://localhost:8080/api/auth/logout",
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