# API Versioning Examples

This document shows examples of how different Deskbird API endpoints use different versions and how the SDK handles them.

## Per-Endpoint Versioning

Different endpoints in the Deskbird API may use different versions. The SDK now supports this through the `buildVersionedPath` utility and version constants.

### Example: Mixed API Versions

```typescript
import { createDeskbirdClient, buildVersionedPath, API_VERSIONS } from './sdk';

const client = createDeskbirdClient({
  environment: 'production',
  refreshToken: process.env.REFRESH_TOKEN!,
  googleApiKey: process.env.GOOGLE_API_KEY!,
});

await client.initialize();

// Example 1: Bookings use v1.1
const bookings = await client.apiCall('GET', '/v1.1/user/bookings');

// Example 2: Some newer features might use v3
const newFeature = await client.apiCall('GET', '/v3/some-new-endpoint');

// Example 3: Auto-versioning (defaults to v1.1 if no version specified)
const user = await client.apiCall('GET', '/user'); // Becomes /v1.1/user
```

### API Client Implementation

Each API client specifies the appropriate version for its endpoints:

```typescript
// Bookings API - uses v1.1
export class BookingsApi {
  async createBooking(request: CreateBookingRequest) {
    const response = await this.client.post<CreateBookingResponse>(
      buildVersionedPath(API_VERSIONS.V1_1, '/bookings'), // /v1.1/bookings
      request
    );
    // ...
  }
  
  async getUserBookings(params: GetUserBookingsParams) {
    const response = await this.client.get<BookingsListResponse>(
      buildVersionedPath(API_VERSIONS.V1_1, '/user/bookings') // /v1.1/user/bookings
    );
    // ...
  }
}

// Future API - might use v3
export class NewFeaturesApi {
  async getSomeNewData() {
    const response = await this.client.get<NewDataResponse>(
      buildVersionedPath(API_VERSIONS.V3, '/new-feature') // /v3/new-feature
    );
    // ...
  }
}
```

### Configuration per API

If you need to add support for new API versions, simply extend the `API_VERSIONS` constant:

```typescript
// In utils/api-paths.ts
export const API_VERSIONS = {
  V1_1: 'v1.1',
  V3: 'v3',
  V4: 'v4', // Future version
} as const;
```

### Usage Examples by Domain

#### User Operations (v1.1)
```typescript
// All user operations use v1.1
await client.user.getCurrentUser();           // GET /v1.1/user
const favorites = await client.user.getUserFavorites(); // GET /v1.1/user
```

#### Booking Operations (v1.1)
```typescript
// Booking operations use v1.1
await client.bookings.createBooking(request);  // POST /v1.1/bookings
await client.bookings.getUserBookings();       // GET /v1.1/user/bookings
await client.bookings.cancelBooking(id);       // DELETE /v1.1/bookings/{id}
```

#### Favorites Operations (v1.1)
```typescript
// Favorites operations use v1.1
await client.favorites.addFavorite(zoneId);    // PATCH /v1.1/user/favoriteResource
await client.favorites.removeFavorite(zoneId); // DELETE /v1.1/user/favoriteResource/{id}
```

#### Workspace Operations (v1.1)
```typescript
// Workspace operations use v1.1
await client.workspaces.getInternalWorkspaces(companyId);     // GET /v1.1/company/internalWorkspaces
await client.workspaces.getWorkspaceGroups(workspaceId);      // GET /v1.1/company/internalWorkspaces/{id}/groups
await client.workspaces.getFloorConfig(workspaceId, groupId); // GET /v1.1/company/internalWorkspaces/{id}/groups/{gid}/floorConfig
```

### Generic API Calls with Explicit Versioning

```typescript
// Explicit version in path (recommended for clarity)
const response1 = await client.apiCall('GET', '/v1.1/user');
const response2 = await client.apiCall('POST', '/v3/advanced-booking', bookingData);

// Auto-versioning (uses default version from config)
const response3 = await client.apiCall('GET', '/user'); // Becomes /v1.1/user

// With query parameters
const response4 = await client.apiCall('GET', '/v1.1/user/bookings', undefined, {
  limit: 10,
  upcoming: true
});
```

### Migration Strategy for Version Changes

When API endpoints change versions, you only need to update the specific API client:

```typescript
// Before: Using v1.1
const response = await this.client.post<CreateBookingResponse>(
  buildVersionedPath(API_VERSIONS.V1_1, '/bookings'),
  request
);

// After: Upgrade to v3 for enhanced features
const response = await this.client.post<CreateBookingResponse>(
  buildVersionedPath(API_VERSIONS.V3, '/bookings'),
  request
);
```

### Version Detection

The SDK automatically detects if a path already includes a version:

```typescript
// These are equivalent:
await client.apiCall('GET', '/v1.1/user');
await client.apiCall('GET', 'v1.1/user');

// Auto-versioning only happens when no version is detected:
await client.apiCall('GET', '/user'); // Becomes /v1.1/user
await client.apiCall('GET', 'user');  // Becomes /v1.1/user
```

This approach provides maximum flexibility while maintaining clean separation of concerns between different API domains.
