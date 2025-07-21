// Deskbird API configuration for third-party consumers
// Note: As a third-party consumer, we only have access to the production API
export const DESKBIRD_API_CONFIG = {
  baseUrl: 'https://api.deskbird.com',
  version: 'v1.1',
  timeout: 30000, // 30 seconds
  retries: 3,
};

// Google token API configuration
export const GOOGLE_TOKEN_API_CONFIG = {
  baseUrl: 'https://securetoken.googleapis.com/v1/token',
  defaultVersion: 'v1'
};
