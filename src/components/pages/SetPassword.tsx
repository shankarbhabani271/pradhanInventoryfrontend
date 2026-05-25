import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { Lock, User, Phone, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const { token: pathToken } = useParams();
  const token = searchParams.get("token") || pathToken;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    blood: "",
    password: "",
    confirmPassword: "",
  });

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:8080/api/employees/verify-token?token=${token}`
        );
        if (res.data.success) {
          setIsValidToken(true);
          setEmail(res.data.email);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Invalid or expired link");
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { label: "", color: "bg-gray-200" };
    if (pass.length < 6) return { label: "Weak", color: "bg-red-500" };
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) return { label: "Strong", color: "bg-green-500" };
    return { label: "Fair", color: "bg-yellow-500" };
  };

  const strength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password && formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post("http://localhost:8080/api/employees/set-password", {
        token,
        ...formData
      });

      if (res.data.success) {
        toast.success("Account activated successfully!");
        navigate("/login");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to set password");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Verifying your invite link...</div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <XCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Link Expired or Invalid</h2>
          <p className="text-gray-500">
            This invitation link is no longer valid. It may have expired or already been used.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-yellow-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-3xl p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Welcome Aboard!</h1>
          <p className="text-gray-500 mt-2">Complete your profile to activate your account for <span className="font-semibold">{email}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block mb-2 text-sm font-medium">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition"
                required
              />
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label className="block mb-2 text-sm font-medium">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
                className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition"
                required
              />
            </div>
          </div>

          {/* Blood Group */}
          <div>
            <label className="block mb-2 text-sm font-medium">Blood Group (Optional)</label>
            <select
              name="blood"
              value={formData.blood}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition appearance-none"
            >
              <option value="">Select Blood Group</option>
              <option>A+</option>
              <option>B+</option>
              <option>O+</option>
              <option>AB+</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-sm font-medium">Set Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition"
                required
                minLength={8}
              />
            </div>
            {formData.password && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.label === 'Weak' ? '33%' : strength.label === 'Fair' ? '66%' : '100%' }}></div>
                </div>
                <span className="text-xs text-gray-500 font-medium">{strength.label}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition"
                required
              />
              {passwordsMatch && (
                <CheckCircle className="absolute right-3 top-3 text-green-500" size={18} />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !passwordsMatch || formData.password.length < 8}
            className="w-full py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition disabled:opacity-50 mt-4 font-semibold"
          >
            {isSubmitting ? "Activating..." : "Set Password & Activate"}
          </button>
        </form>
      </div>
    </div>
  );
}
