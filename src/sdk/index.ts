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

export type { Environment } from './config/environments.js';

// API client exports
export { AuthApi } from './api/auth.api.js';
export { UserApi } from './api/user.api.js';
export { BookingsApi } from './api/bookings.api.js';
export { FavoritesApi } from './api/favorites.api.js';
export { WorkspacesApi } from './api/workspaces.api.js';

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
 * Similar to createOmniAdministrationClient from the reference implementation
 */
export function createDeskbirdClient(config: CreateDeskbirdClientConfig): DeskbirdSdk {
  console.log(`[Deskbird SDK] Creating client for environment: ${config.environment}`);
  
  // Map the minimal config to the full SDK config
  const sdkConfig: DeskbirdSdkConfig = {
    environment: config.environment,
    refreshToken: config.refreshToken,
    googleApiKey: config.googleApiKey,
    
    // Optional configurations
    timeout: config.timeout,
    apiVersion: config.apiVersion,
    defaultWorkspaceId: config.defaultWorkspaceId,
    defaultResourceId: config.defaultResourceId,
    defaultGroupId: config.defaultGroupId,
    enableRequestLogging: config.enableRequestLogging,
  };

  // Create and return the SDK instance
  return new DeskbirdSdk(sdkConfig);
}
