// Generic API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  requestInfo: {
    method: string;
    url: string;
    timestamp: string;
  };
}

// Pagination interface
export interface PaginationInfo {
  totalCount: number;
  currentCount: number;
  maximumCountPerPage: number;
  next: string;
  previous: string;
}

// Generic paginated response
export interface PaginatedResponse<T> {
  totalCount: number;
  maximumCountPerPage: number;
  currentCount: number;
  next: string;
  previous: string;
  success: boolean;
  results: T[];
}

// Generic error response
export interface ApiError {
  error: string;
  message?: string;
  code?: string | number;
  details?: any;
}

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Generic API call parameters
export interface ApiCallParams {
  method: HttpMethod;
  path: string;
  apiVersion?: string;
  body?: Record<string, any>;
  queryParams?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

// Request options for HTTP client
export interface RequestOptions {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}
