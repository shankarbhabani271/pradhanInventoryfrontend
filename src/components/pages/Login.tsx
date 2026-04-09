import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/forms/zodResolver";
import { useDispatch } from "react-redux";
import { setAccessToken } from "@/config/redux/slice/authSlice";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  // Facebook,
} from "lucide-react";
import type { AppDispatch } from "@/config/redux/store/store";
import {
  signInSchema,
  type SignInFormData,
} from "@/validations/auth.validation";
import { GoogleLoginlogin } from "@/config/redux/slice/authSlice";
import { Link, useNavigate } from "react-router-dom";
// import { toast } from "sonner"; // Removed as handleApiError handles toasts
import { handleApiError } from "@/lib/errors/handleApiError";
import ErrorMessage from "@/components/ErrorMessage";
import { set } from "zod";
import api from "@/api/axios";


export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "all",
    reValidateMode: "onChange",
  });

  

 // ✅ LOGIN FUNCTION (CORRECTED)
  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      }
    );

     

      // ✅ get access token
      const token = res?.data?.data?.accessToken;

      if (token) {
        // ✅ store access token
        localStorage.setItem("accessToken", token);

        console.log("ACCESS TOKEN:", token);
        console.log("REFRESH TOKEN stored in cookie (auto)");

        // ✅ redirect
        navigate("/",{replace:true  });
      } else {
        setError("No access token received");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // optional google login
  const Glogin = ({ token }: { token: string }) => {
    dispatch(GoogleLoginlogin({ token }));
  };

  return (
    <div className="min-h-screen w-full bg-card bg-no-repeat bg-center flex items-center justify-center">
      {/* Card */}
      <div className="w-full max-w-md bg-card rounded-lg border border-gray-200 shadow-lg">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground relative flex justify-center">
              Sign In
            </h2>
            <p className="text-sm text-foreground relative flex justify-center">
              Enter your email and password to access your account
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

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
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
                  {...register("email")}
                />
              </div>
              <ErrorMessage error={errors.email?.message} />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  {...register("password")}
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

            {/* Remember & Forgot */}
            <div className="flex items-center justify-end">
              {/* <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div> */}
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex flex-col space-y-4">
            <button
              type="submit"
              className="w-full bg-primary hover:primary text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 animate-spin" size={16} />}
              Sign In
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-foreground">Or</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="flex justify-center items-center gap-3">
              {/* <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <Googl size={20} />
                <span className="ml-2">Google</span>
              </button> */}
            </div>

            <p className="text-center text-sm text-foreground">
              {"Don't have an account? "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}