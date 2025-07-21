// --- Tool-specific Parameter and Result Types ---

import type { Booking } from './bookings.js';
import type { PaginationInfo } from './api.js';

// Tool parameter types
export interface BookDeskParams {
  date: string;
  desk_id: number;
}

export interface GetUserBookingsParams {
  skip?: number;
  limit?: number;
  include_instances?: boolean;
  upcoming?: boolean;
}

export interface FavoriteDeskParams {
  desk_id: number;
}

export interface UnfavoriteDeskParams {
  desk_id: number;
}

export interface GetUserFavoritesParams {
  // No parameters needed for this endpoint
}

export interface GetUserInfoParams {
  // No parameters needed for this endpoint
}

// Tool result types
export interface ToolResult {
  success: boolean;
  message: string;
  details?: any;
}

export interface GetUserBookingsResult extends ToolResult {
  pagination: PaginationInfo;
  bookings: Booking[];
}

// Generic API call tool types
export interface DeskbirdApiCallParams {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  api_version?: string;
  body?: Record<string, any>;
  query_params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

export interface DeskbirdApiCallResponse {
  success: boolean;
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
  requestInfo: {
    method: string;
    url: string;
    timestamp: string;
  };
}
