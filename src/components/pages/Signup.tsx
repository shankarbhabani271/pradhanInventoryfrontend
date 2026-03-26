"use client";

import { handleApiError } from "@/lib/errors/handleApiError";
import ErrorMessage from "@/components/ErrorMessage";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";

import { z } from "zod";
import { AuthAPI } from "@/controller/auth/auth.controller";

/* =========================
   ZOD SCHEMAS (LOCAL)
========================= */

const generateOTPSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

const signUpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .trim(),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .trim(),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/\d/, "Must include at least one number")
    .regex(/[@$!%*?&#]/, "Must include at least one special character"),

  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

/* =========================
   COMPONENT
========================= */

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingOTP, setIsGeneratingOTP] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const email = watch("email");

  /* =========================
     OTP GENERATION
  ========================= */

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
    setError(null);

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

  /* =========================
     SUBMIT
  ========================= */

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const signUpData = {
        ...data,
        phone: Number.parseInt(data.phone),
        otp: Number.parseInt(data.otp),
      };

      const result = await AuthAPI.signUp(signUpData);

      setSuccess("Account created successfully!");
      console.log("Sign up result:", result);
    } catch (err) {
      const appError = handleApiError(err);
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="min-h-screen w-full bg-card bg-no-repeat bg-center flex items-center justify-center">
      <div className="w-full max-w-md bg-card rounded-lg border border-gray-200 shadow-lg">
        <div className="p-6 pb-4">
          <div className="space-y-1 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              Create Account
            </h2>
            <p className="text-sm text-foreground">
              Enter your information to create your account
            </p>
          </div>
        </div>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {error && (
              <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="md:col-span-2 rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            {/* NAME */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3" size={16} />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="text-sm w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  {...register("name")}
                />
              </div>
              <ErrorMessage error={errors.name?.message} />
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3" size={16} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="text-sm w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  {...register("email")}
                />
              </div>
              <ErrorMessage error={errors.email?.message} />
            </div>

            {/* PHONE */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3" size={16} />
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  className="text-sm w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  {...register("phone")}
                />
              </div>
              <ErrorMessage error={errors.phone?.message} />
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="text-sm w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <ErrorMessage error={errors.password?.message} />
            </div>

            {/* OTP */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">OTP</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="text-sm flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  {...register("otp")}
                />
                <button
                  type="button"
                  onClick={generateOTP}
                  disabled={isGeneratingOTP || !email}
                  className="px-3 py-2 border rounded-md disabled:opacity-50"
                >
                  {isGeneratingOTP ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>

              <ErrorMessage error={errors.otp?.message} />

              {otpSent && (
                <p className="text-sm text-green-600">OTP sent successfully!</p>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-6 pb-6 flex flex-col space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-2 rounded-md flex items-center justify-center"
            >
              {isLoading && <Loader2 className="mr-2 animate-spin" size={16} />}
              Create Account
            </button>

            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/" className="text-primary">
                Sign in
              </Link>
            </p>

            <div className="flex justify-center">
             
            </div>

            <p className="text-center text-sm">
              Forgot your password?{" "}
              <Link to="/auth/forgot-password" className="text-primary">
                Reset Password
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}