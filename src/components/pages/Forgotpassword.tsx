"use client";

import { handleApiError } from "@/lib/errors/handleApiError";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff, Loader2, Key } from "lucide-react";
import { generateOTPSchema } from "@/validations/auth.validation";
import { Link } from "react-router-dom";
import ErrorMessage from "@/components/ErrorMessage";
import { AuthAPI } from "@/controller/auth/auth.controller";

interface ResetPasswordForm {
  email: string;
  password: string;
  otp: string;
}

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingOTP, setIsGeneratingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const email = watch("email");

  const generateOTP = async () => {
    if (!email) {
      setError("Please enter your email first");
      return;
    }
    const emailValidation = generateOTPSchema.safeParse({ email });
    if (!emailValidation.success) {
      setError("Please enter a valid email address");
      return;
    }
    setIsGeneratingOTP(true);
    setError("");
    try {
      await AuthAPI.generateOTP({ email });
      setOtpSent(true);
      setSuccess("OTP sent to your email successfully!");
    } catch (err) {
      const appError = handleApiError(err);
      setError(appError.message);
    } finally {
      setIsGeneratingOTP(false);
    }
  };

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    console.log(data);
    try {
      // Simulate password reset
      await AuthAPI.forgotPassword({
        ...data,
        otp: parseInt(data.otp),
      });
      setSuccess("Password reset successfully!");
    } catch (err) {
      const appError = handleApiError(err);
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-cover bg-no-repeat bg-center flex items-center justify-center">
      {" "}
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-lg">
        <div className="p-6 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-sm text-gray-600">
              Enter your email and new password along with the OTP to reset your
              password
            </p>
          </div>
        </div>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 pb-4 space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
              </div>
              <ErrorMessage error={errors.email?.message} />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <ErrorMessage error={errors.password?.message} />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="otp"
                className="text-sm font-medium text-gray-700"
              >
                OTP
              </label>
              <div className="flex space-x-2">
                <input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  {...register("otp", {
                    required: "OTP is required",
                    pattern: {
                      value: /^\d{6}$/,
                      message: "OTP must be 6 digits",
                    },
                  })}
                />
                <button
                  type="button"
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={generateOTP}
                  disabled={isGeneratingOTP || !email}
                >
                  {isGeneratingOTP ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Key size={16} />
                  )}
                </button>
              </div>
              <ErrorMessage error={errors.otp?.message} />
              {otpSent && (
                <p className="text-sm text-green-600">OTP sent successfully!</p>
              )}
            </div>
          </div>

          <div className="px-6 pb-6 flex flex-col space-y-4">
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 animate-spin" size={16} />}
              Reset Password
            </button>
            <p className="text-center text-sm text-gray-600">
              Remember your password?{" "}
              <Link to="/" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}