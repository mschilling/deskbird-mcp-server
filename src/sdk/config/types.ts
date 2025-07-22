// Base SDK configuration interface
export interface BaseSdkConfig {
  timeout?: number;
  apiVersion?: string;
  baseHeaders?: Record<string, string>;
}

// Deskbird-specific SDK configuration
export interface DeskbirdSdkConfig extends BaseSdkConfig {
  // Authentication tokens
  refreshToken: string;
  googleApiKey: string;

  // Optional workspace/resource defaults
  defaultWorkspaceId?: string;
  defaultResourceId?: string;
  defaultGroupId?: string;
  defaultCompanyId?: string;

  // Advanced configuration
  retryAttempts?: number;
  enableRequestLogging?: boolean;
}

// Factory function configuration (minimal required)
export interface CreateDeskbirdClientConfig {
  refreshToken: string;
  googleApiKey: string;

  // Optional configurations
  timeout?: number;
  apiVersion?: string;
  defaultWorkspaceId?: string;
  defaultResourceId?: string;
  defaultGroupId?: string;
  defaultCompanyId?: string;
  enableRequestLogging?: boolean;
}
