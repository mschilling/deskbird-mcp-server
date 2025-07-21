// Environment configuration for Deskbird API
export type Environment = 'production' | 'development';

// Define the internal mapping of environment to URLs
export const DESKBIRD_BASE_URLS: { [key in Environment]: string } = {
  production: 'https://api.deskbird.com',
  development: 'https://api.deskbird.com', // Same for now, could be different staging URL
};

// Google token API configuration
export const GOOGLE_TOKEN_API_CONFIG = {
  baseUrl: 'https://securetoken.googleapis.com/v1/token',
  defaultVersion: 'v1'
};

// Default API configuration
export const DEFAULT_API_CONFIG = {
  version: 'v1.1',
  timeout: 30000, // 30 seconds
  retries: 3,
};
