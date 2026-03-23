export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponse<T> {
  success: false;
  message: string;
  data?: T;
}

// Union type that covers both cases
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse<T>;

// ═══════════════════════════════════════════════════════════════════════════
// PAGINATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

// Pagination metadata returned from API
export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Generic paginated response - use K to specify the data key name
// Example: IPaginatedResponse<TAttendance, 'attendance'> => { attendance: TAttendance[], pagination: { page, limit, total, totalPages } }
export type IPaginatedResponse<T, K extends string> = {
  [P in K]: T[];
} & {
  pagination: IPaginationMeta;
};