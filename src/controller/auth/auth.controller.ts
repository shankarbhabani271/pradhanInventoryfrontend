import { apiCaller } from "@/config/http";
import type { LoginData } from "@/config/redux/slice/authSlice";
import type {
  ForgotPasswordData,
  GenerateOTPData,
  ILoginResponse,
  SignUpData,
} from "@/types/user.type";
const pannel = "user"
const AUTH_PREFIX = "/auth";
export const AuthAPI = {
  login: async (data: LoginData) => {
    const res = await apiCaller<ILoginResponse>({
      // url: "/auth/sign-in",
      url: `${AUTH_PREFIX}/sign-in`,
      method: "POST",
      data: {...data,pannel},
    });

    return res;
  },
  Googlelogin: async (data: {token: string}) => {
    const res = await apiCaller<ILoginResponse>({
      // url: "/auth/sign-in",
      url: `${AUTH_PREFIX}/google-sign-in`,
      method: "POST",
      data: {...data,pannel},
    });

    return res;
  },

  signUp: async (data: SignUpData) => {
    return apiCaller({
      url: `${AUTH_PREFIX}/signUp`,
      method: "POST",
      data,
    });
  },
  googleSignUp: async (data: {token: string}) => {
    return apiCaller({
      url: `${AUTH_PREFIX}/google-sign-up`,
      method: "POST",
      data:{...data,pannel},
    });
  },

  forgotPassword: async (data: ForgotPasswordData) => {
    return apiCaller({
      url: `${AUTH_PREFIX}/forgot`,
      method: "PATCH",
      data,
    });
  },

  generateOTP: async (data: GenerateOTPData) => {
    return apiCaller({
      url: `${AUTH_PREFIX}/generate-otp`,
      method: "POST",
      data,
    });
  },

  refresh: async () => {
    const res = await apiCaller<{ accessToken: string }>({
      // url: "/auth/refresh",
      data: { pannel },
      url: `${AUTH_PREFIX}/refresh`,
      method: "POST",
    });
    return res;
  },

  // /update-profile
  updateProfile: async (data: {name: string,phone: number}, token: string) => {
    const res = await apiCaller({
      url: `${AUTH_PREFIX}/update-profile`,
      method: "PATCH",
      data,
      token,
    });
    return res;
  },

  checkCookies: async () => {
    const res = await apiCaller<void>({
      // url: "/auth/check-cookies",
      url: `${AUTH_PREFIX}/check-cookies`,
      method: "POST",
    });
    return res;
  },
  setcheckCookies: async () => {
    const res = await apiCaller<void>({
      // url: "/auth/set-check-cookies",
      url: `${AUTH_PREFIX}/set-check-cookies`,
      method: "POST",
    });
    return res;
  },

  logout: async () => {
    const res = await apiCaller({
      url: `${AUTH_PREFIX}/logout`,
      // url: "/auth/logout",
      data: { pannel },
      method: "POST",
    });

    return res;
  },
};