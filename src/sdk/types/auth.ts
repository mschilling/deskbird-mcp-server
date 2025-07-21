// Authentication-related types
export interface TokenResponse {
  access_token: string;
  expires_in?: number;
  token_type?: string;
  refresh_token?: string;
}

export interface TokenRefreshParams {
  refresh_token: string;
  grant_type: string;
}

export interface AuthenticationError extends Error {
  code?: string;
  statusCode?: number;
}
