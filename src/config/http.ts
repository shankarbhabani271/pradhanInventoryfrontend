// import { AppError } from "@/lib/errors/AppError";
import type { ApiResponse } from "@/types/global.types";
import axios, { type AxiosRequestConfig } from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://backendprojectbeghg.onrender.com/api";

export const http = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Bypass-Tunnel-Reminder": "true",
    },
});

// http.interceptors.response.use(
//   (res) => res,
//   (error) => {
//     const message =
//       error?.response?.data?.message ||
//       error?.response?.data?.error ||
//       error?.message ||
//       "Something went wrong";

//     const err = new AppError({
//       message,
//       type: "AxiosError",
//       status: error?.response?.status,
//       raw: error,
//     });

//     return Promise.reject(err); // now correct
//   }
// );

export const apiCaller = async <T>(
  config: AxiosRequestConfig & { token?: string },
): Promise<ApiResponse<T>> => {
  const { token, ...rest } = config;

  const response = await http({
    ...rest,
    headers: {
      ...rest.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return response.data;
};