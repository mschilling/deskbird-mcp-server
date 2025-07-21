import type { DeskbirdSdkConfig } from './config/types.js';
import { DESKBIRD_BASE_URLS, DEFAULT_API_CONFIG } from './config/environments.js';
import { HttpClient } from './utils/http-client.js';
import { buildVersionedPath, API_VERSIONS } from './utils/api-paths.js';
import { AuthApi } from './api/auth.api.js';
import { UserApi } from './api/user.api.js';
import { BookingsApi } from './api/bookings.api.js';
import { FavoritesApi } from './api/favorites.api.js';
import { WorkspacesApi } from './api/workspaces.api.js';

/**
 * Main Deskbird SDK class that orchestrates all API clients
 * Similar to OmniAdministrationSdk from the reference implementation
 */
export class DeskbirdSdk {
  private httpClient: HttpClient;
  private authApi: AuthApi;
  private currentAccessToken: string | null = null;
  private tokenRefreshPromise: Promise<string> | null = null;

  // Expose API clients as public properties
  public user: UserApi;
  public bookings: BookingsApi;
  public favorites: FavoritesApi;
  public workspaces: WorkspacesApi;

  // Configuration
  private config: DeskbirdSdkConfig;

  constructor(config: DeskbirdSdkConfig) {
    this.config = {
      apiVersion: DEFAULT_API_CONFIG.version,
      timeout: DEFAULT_API_CONFIG.timeout,
      enableRequestLogging: false,
      ...config,
    };

    // Get base URL for the environment (without version)
    const baseUrl = DESKBIRD_BASE_URLS[config.environment];

    // Initialize HTTP client with base URL only
    this.httpClient = new HttpClient(baseUrl, {
      'Content-Type': 'application/json',
      ...config.baseHeaders,
    }, this.config.timeout);

    // Initialize auth API
    this.authApi = new AuthApi(config.googleApiKey);

    // Initialize other API clients
    this.user = new UserApi(this.httpClient);
    this.bookings = new BookingsApi(this.httpClient);
    this.favorites = new FavoritesApi(this.httpClient);
    this.workspaces = new WorkspacesApi(this.httpClient);

    console.log(`[Deskbird SDK] Initialized for environment: ${config.environment}`);
  }

  /**
   * Ensure we have a valid access token
   */
  private async ensureAccessToken(): Promise<string> {
    // If we have a token refresh in progress, wait for it
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    // If we don't have a token or it might be expired, refresh it
    if (!this.currentAccessToken) {
      this.tokenRefreshPromise = this.refreshAccessToken();
      
      try {
        this.currentAccessToken = await this.tokenRefreshPromise;
        this.updateHttpClientAuth();
        return this.currentAccessToken;
      } finally {
        this.tokenRefreshPromise = null;
      }
    }

    return this.currentAccessToken;
  }

  /**
   * Refresh the access token
   */
  private async refreshAccessToken(): Promise<string> {
    console.log('[Deskbird SDK] Refreshing access token');
    
    try {
      const accessToken = await this.authApi.refreshAccessToken(this.config.refreshToken);
      this.currentAccessToken = accessToken;
      this.updateHttpClientAuth();
      return accessToken;
    } catch (error) {
      console.error('[Deskbird SDK] Failed to refresh access token:', error);
      throw error;
    }
  }

  /**
   * Update HTTP client with current authentication
   */
  private updateHttpClientAuth(): void {
    if (this.currentAccessToken) {
      this.httpClient.setDefaultHeaders({
        'Authorization': `Bearer ${this.currentAccessToken}`,
      });
    }
  }

  /**
   * Initialize the SDK (authenticate and prepare for API calls)
   */
  async initialize(): Promise<void> {
    console.log('[Deskbird SDK] Initializing SDK');
    
    try {
      await this.ensureAccessToken();
      console.log('[Deskbird SDK] SDK initialized successfully');
    } catch (error) {
      console.error('[Deskbird SDK] Failed to initialize SDK:', error);
      throw error;
    }
  }

  /**
   * Make a generic API call (similar to the generic API tool)
   * @param method HTTP method
   * @param path API path with version (e.g., '/v1.1/user' or '/v3/bookings')
   * @param body Request body
   * @param queryParams Query parameters
   * @param headers Additional headers
   */
  async apiCall<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: any,
    queryParams?: Record<string, string | number | boolean>,
    headers?: Record<string, string>
  ): Promise<T> {
    console.log(`[Deskbird SDK] Making ${method} request to: ${path}`);
    
    await this.ensureAccessToken();

    // If path doesn't start with /v, assume it needs the default version
    let fullPath = path;
    if (!path.match(/^\/v\d+(\.\d+)?/)) {
      fullPath = buildVersionedPath(this.config.apiVersion || API_VERSIONS.V1_1, path);
      console.log(`[Deskbird SDK] Auto-versioned path: ${fullPath}`);
    }

    // Build query string if provided
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        params.append(key, String(value));
      }
      fullPath += `?${params.toString()}`;
    }

    const response = await this.httpClient.request<T>(
      method,
      fullPath,
      body,
      { headers }
    );

    if (!response.success) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return response.data as T;
  }

  /**
   * Get workspace and group IDs with auto-discovery
   */
  async getWorkspaceConfig(): Promise<{
    workspaceId: string;
    groupId: string;
  }> {
    console.log('[Deskbird SDK] Getting workspace configuration');
    
    await this.ensureAccessToken();

    // Use provided defaults or auto-discover
    let workspaceId = this.config.defaultWorkspaceId;
    let groupId = this.config.defaultGroupId;

    if (!workspaceId) {
      workspaceId = await this.workspaces.discoverWorkspaceId(this.user);
    }

    if (!groupId) {
      groupId = await this.workspaces.discoverGroupId(workspaceId, this.user);
    }

    return { workspaceId, groupId };
  }

  /**
   * Find zone ID for a desk number (convenience method)
   */
  async findDeskZoneId(deskNumber: number): Promise<number | null> {
    console.log(`[Deskbird SDK] Finding zone ID for desk: ${deskNumber}`);
    
    const { workspaceId, groupId } = await this.getWorkspaceConfig();
    return this.workspaces.findDeskZoneId(deskNumber, workspaceId, groupId);
  }

  /**
   * Get all available desks (convenience method)
   */
  async getAvailableDesks() {
    console.log('[Deskbird SDK] Getting all available desks');
    
    const { workspaceId, groupId } = await this.getWorkspaceConfig();
    return this.workspaces.getAvailableDesks(workspaceId, groupId);
  }

  /**
   * Book a desk for a specific date (high-level convenience method)
   */
  async bookDesk(params: {
    deskNumber: number;
    date: string;
    startHour?: number;
    endHour?: number;
  }) {
    console.log(`[Deskbird SDK] Booking desk ${params.deskNumber} for ${params.date}`);
    
    await this.ensureAccessToken();

    // Get zone ID for the desk
    const zoneId = await this.findDeskZoneId(params.deskNumber);
    if (!zoneId) {
      throw new Error(`Desk ${params.deskNumber} not found`);
    }

    // Get workspace configuration
    const { workspaceId } = await this.getWorkspaceConfig();

    // Parse date and create booking times
    const { DateUtils } = await import('./utils/date-utils.js');
    const bookingDate = DateUtils.parseDate(params.date);
    const { start, end } = DateUtils.getWorkHours(
      bookingDate,
      params.startHour,
      params.endHour
    );

    // Create booking request
    const bookingRequest = {
      bookings: [{
        bookingStartTime: DateUtils.toTimestamp(start),
        bookingEndTime: DateUtils.toTimestamp(end),
        isAnonymous: false,
        resourceId: this.config.defaultResourceId || '',
        zoneItemId: zoneId,
        workspaceId,
      }],
    };

    return this.bookings.createBooking(bookingRequest);
  }

  /**
   * Add desk to favorites by desk number (convenience method)
   */
  async favoriteDeskByNumber(deskNumber: number) {
    console.log(`[Deskbird SDK] Adding desk ${deskNumber} to favorites`);
    
    const zoneId = await this.findDeskZoneId(deskNumber);
    if (!zoneId) {
      throw new Error(`Desk ${deskNumber} not found`);
    }

    return this.favorites.addFavorite(zoneId);
  }

  /**
   * Remove desk from favorites by desk number (convenience method)
   */
  async unfavoriteDeskByNumber(deskNumber: number) {
    console.log(`[Deskbird SDK] Removing desk ${deskNumber} from favorites`);
    
    const zoneId = await this.findDeskZoneId(deskNumber);
    if (!zoneId) {
      throw new Error(`Desk ${deskNumber} not found`);
    }

    return this.favorites.removeFavorite(zoneId);
  }

  /**
   * Get the underlying HTTP client (use with caution)
   */
  getHttpClient(): HttpClient {
    return this.httpClient;
  }

  /**
   * Get current configuration
   */
  getConfig(): DeskbirdSdkConfig {
    return { ...this.config };
  }
}
