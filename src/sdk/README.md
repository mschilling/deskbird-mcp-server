# Deskbird SDK

A TypeScript SDK for interacting with the Deskbird API, designed with a clean and extensible architecture similar to enterprise-grade SDKs.

## Features

- 🏗️ **Modular Architecture**: Organized into separate API clients for different domains
- 🔐 **Authentication Management**: Automatic token refresh and management
- 🛡️ **Error Handling**: Comprehensive error handling with business exception support
- 📅 **Date Utilities**: Built-in date validation and timezone handling
- 🔧 **TypeScript Support**: Full type safety with comprehensive interfaces
- 🎯 **Environment Support**: Production and development environment configurations
- 📦 **Factory Pattern**: Easy client creation with sensible defaults

## Installation

The SDK is part of the Deskbird MCP Server project. Import it directly:

```typescript
import { createDeskbirdClient } from './sdk';
```

## Quick Start

### Basic Setup

```typescript
import { createDeskbirdClient } from './sdk';

// Create the client
const client = createDeskbirdClient({
  environment: 'production', // or 'development'
  refreshToken: 'your-refresh-token',
  googleApiKey: 'your-google-api-key',
  defaultWorkspaceId: 'workspace-123', // optional
  defaultResourceId: 'resource-456', // optional
});

// Initialize the SDK (handles authentication)
await client.initialize();
```

### Environment Configuration

```typescript
// Using environment variables
const client = createDeskbirdClient({
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  refreshToken: process.env.REFRESH_TOKEN!,
  googleApiKey: process.env.GOOGLE_API_KEY!,
  defaultWorkspaceId: process.env.DESKBIRD_WORKSPACE_ID,
  defaultResourceId: process.env.DESKBIRD_RESOURCE_ID,
  enableRequestLogging: process.env.NODE_ENV === 'development',
});
```

## API Reference

### User Operations

```typescript
// Get current user information
const user = await client.user.getCurrentUser();

// Get user profile summary
const profile = await client.user.getUserProfile();

// Get user's favorite desks
const favorites = await client.user.getUserFavorites();
```

### Booking Operations

```typescript
// Create a booking
const booking = await client.bookings.createBooking({
  bookings: [{
    bookingStartTime: startTime,
    bookingEndTime: endTime,
    isAnonymous: false,
    resourceId: 'resource-id',
    zoneItemId: 123,
    workspaceId: 'workspace-id',
  }]
});

// Get user's bookings
const bookings = await client.bookings.getUserBookings({
  limit: 10,
  upcoming: true,
});

// Get upcoming bookings
const upcoming = await client.bookings.getUpcomingBookings(5);

// Cancel a booking
await client.bookings.cancelBooking('booking-id');
```

### Favorites Operations

```typescript
// Add desk to favorites (by zone ID)
await client.favorites.addFavorite(zoneId);

// Remove desk from favorites
await client.favorites.removeFavorite(zoneId);

// Toggle favorite status
await client.favorites.toggleFavorite(zoneId, true);
```

### Workspace Operations

```typescript
// Get available desks
const desks = await client.workspaces.getAvailableDesks(workspaceId, groupId);

// Find zone ID by desk number
const zoneId = await client.workspaces.findDeskZoneId(57, workspaceId, groupId);

// Auto-discover workspace configuration
const config = await client.getWorkspaceConfig();
```

### High-Level Convenience Methods

```typescript
// Book a desk by desk number (automatically finds zone ID)
const result = await client.bookDesk({
  deskNumber: 57,
  date: '2025-07-22',
  startHour: 9,  // optional, defaults to 9
  endHour: 18,   // optional, defaults to 18
});

// Favorite a desk by desk number
await client.favoriteDeskByNumber(57);

// Unfavorite a desk by desk number
await client.unfavoriteDeskByNumber(57);

// Get all available desks (auto-discovers workspace/group)
const allDesks = await client.getAvailableDesks();

// Find zone ID for any desk number
const zoneId = await client.findDeskZoneId(57);
```

### Generic API Calls

```typescript
// Make any API call
const response = await client.apiCall('GET', '/user');

// With query parameters
const bookings = await client.apiCall('GET', '/user/bookings', undefined, {
  limit: 5,
  upcoming: true,
});

// With request body
const newBooking = await client.apiCall('POST', '/bookings', {
  bookings: [/* booking data */]
});
```

## Date Utilities

The SDK includes comprehensive date utilities:

```typescript
import { DateUtils } from './sdk';

// Parse and validate dates
const date = DateUtils.parseDate('2025-07-22');

// Check if date is weekend
const isWeekend = DateUtils.isWeekend(date);

// Get work hours for a date
const { start, end } = DateUtils.getWorkHours(date, 9, 18);

// Validate booking dates
const validation = DateUtils.validateBookingDate('2025-07-22', {
  allowWeekends: false,
  allowPastDates: false,
});

if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}
```

## Error Handling

The SDK provides comprehensive error handling:

```typescript
import { DeskbirdApiError } from './sdk';

try {
  await client.bookDesk({
    deskNumber: 57,
    date: '2025-07-22',
  });
} catch (error) {
  if (error instanceof DeskbirdApiError) {
    console.log('Business exception code:', error.businessExceptionCode);
    console.log('HTTP status:', error.statusCode);
    console.log('Original error:', error.originalError);
  } else {
    console.log('Other error:', error.message);
  }
}
```

## Architecture

### Directory Structure

```
src/sdk/
├── index.ts                    # Main SDK export and factory function
├── deskbird-sdk.ts            # Main SDK orchestrator class
├── config/
│   ├── environments.ts        # Environment configurations
│   └── types.ts               # Configuration types
├── api/
│   ├── auth.api.ts            # Authentication API client
│   ├── bookings.api.ts        # Bookings API client
│   ├── user.api.ts            # User API client
│   ├── favorites.api.ts       # Favorites API client
│   └── workspaces.api.ts      # Workspaces API client
├── types/
│   ├── index.ts               # Type exports
│   ├── api.ts                 # Generic API types
│   └── auth.ts                # Authentication types
└── utils/
    ├── error-handler.ts       # Error handling utilities
    ├── http-client.ts         # HTTP client utilities
    └── date-utils.ts          # Date/time utilities
```

### Design Patterns

- **Factory Pattern**: `createDeskbirdClient()` for easy instantiation
- **Composition**: Main SDK class composes multiple API clients
- **Error Handling**: Centralized error handling with business exception support
- **Configuration**: Environment-based configuration with sensible defaults
- **Type Safety**: Comprehensive TypeScript interfaces and types

## Migration from Direct API Calls

### Before (Direct API calls)
```typescript
// Manual token refresh
const accessToken = await this._getNewAccessToken(refreshToken, googleApiKey);

// Manual API call construction
const response = await fetch(`${DESKBIRD_API_BASE_URL}/user`, {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});

const userData = await response.json();
```

### After (Using SDK)
```typescript
// SDK handles authentication automatically
const client = await initializeSdk();

// Clean, typed API calls
const userData = await client.user.getCurrentUser();
```

## Advanced Usage

### Custom HTTP Client Configuration

```typescript
const client = createDeskbirdClient({
  environment: 'production',
  refreshToken: 'token',
  googleApiKey: 'key',
  timeout: 60000, // 60 seconds
});

// Access the underlying HTTP client if needed
const httpClient = client.getHttpClient();
httpClient.setDefaultHeaders({
  'X-Custom-Header': 'value',
});
```

### Environment-Specific Configuration

```typescript
// Development environment with logging
const devClient = createDeskbirdClient({
  environment: 'development',
  refreshToken: process.env.REFRESH_TOKEN!,
  googleApiKey: process.env.GOOGLE_API_KEY!,
  enableRequestLogging: true,
  timeout: 30000,
});

// Production environment
const prodClient = createDeskbirdClient({
  environment: 'production',
  refreshToken: process.env.REFRESH_TOKEN!,
  googleApiKey: process.env.GOOGLE_API_KEY!,
  enableRequestLogging: false,
  timeout: 15000,
});
```

## Contributing

The SDK follows the established patterns from the reference Omni Administration SDK:

1. **API Clients**: Each domain (user, bookings, etc.) has its own API client
2. **Error Handling**: Use `handleDeskbirdException` for consistent error handling
3. **Types**: Define comprehensive TypeScript interfaces
4. **Testing**: Add tests for new functionality
5. **Documentation**: Update this README for new features

## License

ISC License - see main project LICENSE file.
