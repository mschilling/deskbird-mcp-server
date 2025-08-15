/**
 * Utility functions for building API paths with versions
 */

/**
 * Build a versioned API path
 * @param version - API version (e.g., 'v1.1', 'v3')
 * @param path - The endpoint path (e.g., '/bookings', '/user')
 * @returns Full versioned path (e.g., '/v1.1/bookings')
 */
export function buildVersionedPath(version: string, path: string): string {
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Ensure version starts with v
  const cleanVersion = version.startsWith('v') ? version : `v${version}`;

  return `/${cleanVersion}${cleanPath}`;
}

/**
 * Common API versions used by Deskbird endpoints
 */
export const API_VERSIONS = {
  V1_1: 'v1.1',
  V1_2: 'v1.2',
  V2: 'v2', // Added V2
  V3: 'v3',
} as const;

/**
 * API version type
 */
export type ApiVersion = typeof API_VERSIONS[keyof typeof API_VERSIONS];

/**
 * Endpoint-specific API versions mapping
 * Each endpoint can use a different API version
 */
export const ENDPOINT_VERSIONS = {
  // Authentication endpoints
  AUTH_LOGIN: API_VERSIONS.V1_1,
  AUTH_REFRESH: API_VERSIONS.V1_1,

  // Booking endpoints
  BOOKINGS_LIST: API_VERSIONS.V1_1,
  BOOKINGS_CREATE: API_VERSIONS.V1_1,
  BOOKINGS_DELETE: API_VERSIONS.V1_1,
  BOOKINGS_GET: API_VERSIONS.V1_1,
  USER_BOOKINGS: API_VERSIONS.V1_1,

  // User endpoints
  USER_PROFILE: API_VERSIONS.V1_1,
  USER_PREFERENCES: API_VERSIONS.V1_1,
  USER_SEARCH: API_VERSIONS.V3,
  USER_DETAILS: API_VERSIONS.V1_1, // Updated to v1.1 based on user feedback
  USER_FOLLOW_REQUEST: API_VERSIONS.V1_1,
  USER_UNFOLLOW: API_VERSIONS.V1_1,

  // Workspace endpoints - these could use v3 for newer features
  WORKSPACES_INTERNAL: API_VERSIONS.V1_1, // Currently using v1.1, can change to V3 if needed
  WORKSPACE_GROUPS: API_VERSIONS.V1_1,    // Currently using v1.1, can change to V3 if needed
  WORKSPACE_FLOOR_CONFIG: API_VERSIONS.V1_1, // Currently using v1.1, can change to V3 if needed
  WORKSPACES_LIST: API_VERSIONS.V3,       // Example of v3 endpoint
  WORKSPACE_DETAILS: API_VERSIONS.V3,     // Example of v3 endpoint
  WORKSPACE_FLOORS: API_VERSIONS.V3,      // Example of v3 endpoint
  WORKSPACE_DESKS: API_VERSIONS.V3,       // Example of v3 endpoint

  // Favorites endpoints
  FAVORITES_LIST: API_VERSIONS.V1_1,
  FAVORITES_ADD: API_VERSIONS.V1_1,
  FAVORITES_REMOVE: API_VERSIONS.V1_1,

  // Scheduling endpoints
  SCHEDULING_LIST: API_VERSIONS.V2,
  SCHEDULING_STAFF_PLANNING: API_VERSIONS.V2,
} as const;

/**
 * Helper function to get the versioned path for a specific endpoint
 * @param endpoint - The endpoint key from ENDPOINT_VERSIONS
 * @param path - The base path
 * @returns Versioned path using the endpoint's specified version
 */
export function getVersionedEndpoint(
  endpoint: keyof typeof ENDPOINT_VERSIONS,
  path: string
): string {
  const version = ENDPOINT_VERSIONS[endpoint];
  return buildVersionedPath(version, path);
}
