import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../config/http";
import { toast } from "sonner";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/employees/register`,
        { password }
      );

      toast.success("Password Reset Successfully");
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900 to-indigo-900 px-4 py-8">

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left Section */}
        <div className="hidden md:flex flex-col justify-center items-center text-white p-10 bg-gradient-to-br from-purple-600/40 to-indigo-600/40">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6">
            <Lock size={40} />
          </div>

          <h1 className="text-4xl font-bold mb-4">
            Secure Account
          </h1>

          <p className="text-center text-gray-200">
            Reset your password and protect your account with a strong new password.
          </p>
        </div>

        {/* Right Section */}
        <div className="bg-white p-6 sm:p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
            Reset Password
          </h2>

          <p className="text-gray-500 text-center mb-8">
            Create your new password
          </p>

          <form onSubmit={handleSubmit}>
            
            {/* Password */}
            <div className="mb-5">
              <label className="block font-medium mb-2">
                New Password
              </label>

              <div className="flex items-center border rounded-xl px-4 py-3">
                <Lock className="text-purple-600 mr-3" size={18} />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="flex-1 outline-none"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block font-medium mb-2">
                Confirm Password
              </label>

              <div className="flex items-center border rounded-xl px-4 py-3">
                <Lock className="text-purple-600 mr-3" size={18} />

                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm password"
                  className="flex-1 outline-none"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm(!showConfirm)
                  }
                >
                  {showConfirm ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition"
            >
              Reset Password
            </button>
          </form>

          
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;