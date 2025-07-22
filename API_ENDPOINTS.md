# Deskbird API Endpoints Documentation

This document provides a comprehensive overview of all API endpoints implemented in the Deskbird MCP Server SDK.

## API Base Configuration

- **Base URL**: `https://api.deskbird.com`
- **Authentication**: Bearer token (OAuth 2.0)
- **Default Timeout**: 30 seconds
- **Default Retries**: 3

## Endpoints Overview

| Endpoint Path | HTTP Method | Query String Options | API Version | Comments/Description |
|---------------|-------------|---------------------|-------------|---------------------|
| `/user` | GET | None | v1.1 | Get current user profile information |
| `/users` | GET | `searchQuery`, `companyId`, `offset`, `limit`, `sortField`, `sortOrder`, `excludeUserIds` | v3 | Search for users in the company |
| `/users/{userId}` | GET | None | v3 | Get detailed user information by user ID |
| `/user/favoriteResource` | PATCH | None | v1.1 | Add a desk to user's favorites (body: `{id: zoneId}`) |
| `/user/favoriteResource/{zoneId}` | DELETE | None | v1.1 | Remove a desk from user's favorites |
| `/bookings` | POST | None | v1.1 | Create a new booking (body: booking request) |
| `/user/bookings` | GET | `skip`, `limit`, `includeInstances`, `upcoming` | v1.1 | Get user's bookings with filtering |
| `/bookings/{bookingId}` | DELETE | None | v1.1 | Cancel a booking by ID |
| `/bookings/{bookingId}` | GET | None | v1.1 | Get booking details by ID |
| `/company/internalWorkspaces` | GET | `companyId`, `includeInactive` | v1.1 | Get internal workspaces for a company |
| `/company/internalWorkspaces/{workspaceId}/groups` | GET | None | v1.1 | Get groups for a workspace |
| `/company/internalWorkspaces/{workspaceId}/groups/{groupId}/floorConfig` | GET | None | v1.1 | Get floor configuration for a workspace group |

## Authentication Endpoints (Google Token API)

| Endpoint Path | HTTP Method | Query String Options | API Version | Comments/Description |
|---------------|-------------|---------------------|-------------|---------------------|
| `https://securetoken.googleapis.com/v1/token` | POST | `key` (API key) | v1 | Refresh OAuth access token using refresh token |

## Query Parameters Details

### User Search (`/users`)
- `searchQuery` (string, required): Search term for finding users
- `companyId` (number, required): Company ID to search within
- `offset` (number, optional): Number of results to skip (default: 0)
- `limit` (number, optional): Maximum results to return (default: 30)
- `sortField` (string, optional): Field to sort by (default: "userName")
- `sortOrder` (string, optional): Sort order "ASC" or "DESC" (default: "ASC")
- `excludeUserIds` (string, optional): Comma-separated list of user IDs to exclude

### User Bookings (`/user/bookings`)
- `skip` (number, optional): Number of bookings to skip (default: 0)
- `limit` (number, optional): Maximum bookings to return (default: 10)
- `includeInstances` (boolean, optional): Include booking instances (default: true)
- `upcoming` (boolean, optional): Filter to upcoming bookings only (default: true)

### Internal Workspaces (`/company/internalWorkspaces`)
- `companyId` (string, required): Company ID to get workspaces for
- `includeInactive` (boolean, optional): Include inactive workspaces (default: false)

## API Versioning Strategy

The SDK uses endpoint-specific versioning, where different endpoints can use different API versions:

- **v1.1**: Most common endpoints (user profile, bookings, favorites, workspaces)
- **v3**: Newer user-related endpoints (user search, user details)

The versioning is handled automatically by the `getVersionedEndpoint()` utility function, which maps each endpoint to its appropriate API version.

## Request/Response Patterns

### Authentication
- All Deskbird API calls require a Bearer token in the Authorization header
- Tokens are refreshed using the Google Token API when expired

### Error Handling
- All API calls are wrapped with exception handling via `handleDeskbirdException()`
- Failed requests throw errors with status codes and descriptive messages

### Response Structure
- Most endpoints return data in a consistent structure with `success`, `data`, `status`, and `statusText` fields
- List endpoints typically include pagination metadata (`total`, `offset`, `limit`)

## Usage Examples

### Get Current User
```typescript
const user = await userApi.getCurrentUser();
```

### Search Users
```typescript
const searchResults = await userApi.searchUsers({
  searchQuery: "john",
  companyId: 2927,
  limit: 20
});
```

### Create Booking
```typescript
const booking = await bookingsApi.createBooking({
  resourceId: "desk-123",
  startDate: "2025-07-23T09:00:00Z",
  endDate: "2025-07-23T17:00:00Z"
});
```

### Add Favorite Desk
```typescript
const result = await favoritesApi.addFavorite(zoneId);
```

### Get Available Desks
```typescript
const desks = await workspacesApi.getAvailableDesks(workspaceId, groupId);
```
