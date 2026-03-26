// src/lib/errors/AppError.ts

export class AppError extends Error {
  readonly type: "AxiosError" | "JavaScriptError" | "UnknownError";
  readonly status?: number;
  readonly raw?: unknown;

  constructor(opts: {
    message: string;
    type: "AxiosError" | "JavaScriptError" | "UnknownError";
    status?: number;
    raw?: unknown;
  }) {
    super(opts.message);
    this.type = opts.type;
    this.status = opts.status;
    this.raw = opts.raw;
  }
}