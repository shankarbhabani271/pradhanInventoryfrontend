import axios from "axios";

export const sendOtp = async (email: string) => {
  const response = await axios.post(
    "http://localhost:8080/api/auth/send-otp",
    { email }
  );

  return response.data;
};