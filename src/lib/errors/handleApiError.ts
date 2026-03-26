// src/lib/errors/handleApiError.ts
import { toast } from "sonner";
import { AppError } from "./AppError";
import type { AxiosError } from "axios";

export function handleApiError(error: unknown): AppError {
  let finalError: AppError;
  if (error instanceof AppError) {
    finalError = error;
  } else if (isAxiosError(error)) {
    const axiosErr = error as AxiosError;

    const message =
      axiosErr.response?.data &&
      typeof axiosErr.response.data === "object" &&
      axiosErr.response.data !== null &&
      "message" in axiosErr.response.data
        ? String((axiosErr.response.data as { message?: unknown }).message)
        : axiosErr.message || "Request failed";

    finalError = new AppError({
      message,
      type: "AxiosError",
      status: axiosErr.response?.status,
      raw: axiosErr,
    });
  } else if (error instanceof Error) {
    finalError = new AppError({
      message: error.message,
      type: "JavaScriptError",
      raw: error,
    });
  } else {
    finalError = new AppError({
      message: "Unexpected error occurred",
      type: "UnknownError",
      raw: error,
    });
  }

  // Show toast
  toast.error(finalError.message);

  return finalError;
}

function isAxiosError(error: unknown): error is AxiosError {
  if (typeof error !== "object" || error === null) return false;

  // we only cast the small inspected part
  return (
    "isAxiosError" in error &&
    (error as { isAxiosError: unknown }).isAxiosError === true
  );
}