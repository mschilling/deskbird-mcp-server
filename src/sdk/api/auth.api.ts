import { GOOGLE_TOKEN_API_CONFIG } from '../config/environments.js';
import type { TokenResponse } from '../types/auth.js';
import { handleDeskbirdException } from '../utils/error-handler.js';
import { HttpClient } from '../utils/http-client.js';

/**
 * Authentication API client for managing tokens
 */
export class AuthApi {
  private httpClient: HttpClient;
  private googleApiKey: string;

  constructor(googleApiKey: string) {
    this.googleApiKey = googleApiKey;
    this.httpClient = new HttpClient(GOOGLE_TOKEN_API_CONFIG.baseUrl);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    console.log('[Auth API] Refreshing access token');
    
    try {
      // Use URLSearchParams for form data
      const formData = new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });
      
      const response = await fetch(`${GOOGLE_TOKEN_API_CONFIG.baseUrl}?key=${this.googleApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[Auth API] Token refresh failed:', errorData);
        throw new Error(`Token refresh failed with status ${response.status}`);
      }

      const tokenResponse: TokenResponse = await response.json();

      if (!tokenResponse.access_token) {
        console.error('[Auth API] No access token in response:', tokenResponse);
        throw new Error('No access token received from refresh endpoint');
      }

      console.log('[Auth API] Access token refreshed successfully');
      return tokenResponse.access_token;
    } catch (error: unknown) {
      handleDeskbirdException(error, 'refreshAccessToken');
    }
  }

  /**
   * Validate if a token is still valid (basic check)
   */
  async validateToken(accessToken: string, deskbirdBaseUrl: string): Promise<boolean> {
    try {
      // Try to make a simple API call to validate the token
      const testClient = new HttpClient(deskbirdBaseUrl);
      testClient.setDefaultHeaders({ 'Authorization': `Bearer ${accessToken}` });
      
      const response = await testClient.get('/user');
      return response.success;
    } catch {
      return false;
    }
  }
}
