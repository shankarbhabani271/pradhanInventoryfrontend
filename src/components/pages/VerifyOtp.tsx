import React, { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
// update path if needed
import bgImage from "../../assets/otp-bg.png";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300);
  const navigate = useNavigate();
const location = useLocation();

const email = location.state?.email;
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto move next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

const handleVerify = async () => {
  const finalOtp = otp.join("");

  if (finalOtp.length !== 6) {
    alert("Enter complete OTP");
    return;
  }

  try {
    const res = await axios.post(
  "http://localhost:8080/api/employees/verify-otp",
  {
    email,
    otp: finalOtp
  }
);

  if (res.data.success) {
  toast.success("OTP Verified Successfully");

  navigate("/");
}

  } catch (error: any) {
    alert(
      error.response?.data?.message || "Invalid OTP"
    );
  }
};

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* Dark overlay for premium look */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* OTP Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-lg w-full max-w-md sm:max-w-lg rounded-3xl shadow-2xl p-5 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-yellow-500" size={30} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Verify OTP
          </h2>

          <p className="text-gray-500 text-sm mt-2">
            Enter the OTP sent to your email
          </p>
        </div>

        {/* OTP Boxes */}
       <div className="flex justify-center gap-2 sm:gap-3 mb-6 flex-wrap">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) =>
                handleChange(e.target.value, index)
              }
             className="w-10 h-10 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          ))}
        </div>

        {/* Timer */}
        <p className="text-center text-sm text-gray-500 mb-5">
          OTP expires in{" "}
          <span className="text-red-500 font-bold">
            {Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, "0")}
          </span>
        
        </p>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition duration-300"
        >
          Verify OTP
        </button>

        {/* Resend */}
        <p className="text-center text-sm mt-5 text-gray-500">
          Didn’t receive OTP?{" "}
          <span className="text-blue-600 cursor-pointer font-medium">
            Resend
          </span>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;