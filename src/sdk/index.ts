// Main SDK exports
import { DeskbirdSdk } from './deskbird-sdk.js';
import type {
  DeskbirdSdkConfig,
  CreateDeskbirdClientConfig,
} from './config/types.js';

export { DeskbirdSdk };

// Configuration types
export type {
  DeskbirdSdkConfig,
  CreateDeskbirdClientConfig,
  BaseSdkConfig,
} from './config/types.js';

// API client exports
export { AuthApi } from './api/auth.api.js';
export { UserApi } from './api/user.api.js';
export { BookingsApi } from './api/bookings.api.js';
export { FavoritesApi } from './api/favorites.api.js';
export { WorkspacesApi } from './api/workspaces.api.js';
export { SchedulingApi } from './api/scheduling.api.js';

// Utility exports
export { HttpClient } from './utils/http-client.js';
export { DateUtils } from './utils/date-utils.js';
export {
  buildVersionedPath,
  API_VERSIONS,
  type ApiVersion
} from './utils/api-paths.js';
export {
  DeskbirdApiError,
  handleDeskbirdException,
  type BusinessExceptionError,
} from './utils/error-handler.js';

// Re-export relevant types
export * from './types/index.js';

/**
 * Factory function to create a Deskbird SDK client
 * Simplified for third-party API consumers (production only)
 */
export function createDeskbirdClient(config: CreateDeskbirdClientConfig): DeskbirdSdk {
  // SDK creation logging is handled by the SDK constructor

  // Map the minimal config to the full SDK config
  const sdkConfig: DeskbirdSdkConfig = {
    refreshToken: config.refreshToken,
    googleApiKey: config.googleApiKey,

    // Optional configurations
    timeout: config.timeout,
    apiVersion: config.apiVersion,
    defaultWorkspaceId: config.defaultWorkspaceId,
    defaultResourceId: config.defaultResourceId,
    defaultGroupId: config.defaultGroupId,
    defaultCompanyId: config.defaultCompanyId,
    enableRequestLogging: config.enableRequestLogging,
  };

  // Create and return the SDK instance
  return new DeskbirdSdk(sdkConfig);
}
