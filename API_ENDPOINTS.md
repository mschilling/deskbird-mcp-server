# Deskbird API Endpoints Documentation

This document provides a comprehensive overview of all API endpoints implemented in the Deskbird MCP Server SDK.

## API Base Configuration

- **Base URL**: `https://api.deskbird.com`
- **Authentication**: Bearer token (OAuth 2.0)
- **Default Timeout**: 30 seconds
- **Default Retries**: 3

## Endpoints Overview

### User Management

| Endpoint Path | HTTP Method | Query String Options / Request Body | API Version | Comments/Description |
|---------------|-------------|-------------------------------------|-------------|---------------------|
| `/user` | GET | None | v1.1 | Get current user profile information |
| `/users` | GET | `searchQuery`, `companyId`, `offset`, `limit`, `sortField`, `sortOrder`, `excludeUserIds`, `followStatus` | v3 | Search for users in the company with follow system support |
| `/users/{userId}` | GET | None | v3 | Get detailed user information by user ID |
| `/user/corporateInfo` | GET | None | v1.4 | Comprehensive company information |

### Booking Management

| Endpoint Path | HTTP Method | Query String Options / Request Body | API Version | Comments/Description |
|---------------|-------------|-------------------------------------|-------------|---------------------|
| `/bookings` | POST | Booking request (regular or guest) | v1.1 | Create bookings for users or guests |
| `/bookings/{bookingId}` | PATCH | Booking update object | v1.1 | Update booking details (times, etc.) |
| `/bookings/{bookingId}/cancel` | PATCH | `{}` (empty object) | v1.1 | Cancel a booking by ID |
| `/bookings/{bookingId}` | DELETE | None | v1.1 | Cancel a booking by ID |
| `/user/bookings` | GET | `skip`, `limit`, `includeInstances`, `upcoming` | v1.1 | Get user's bookings with filtering |
| `/user/bookings/{bookingId}` | GET | None | v1.1 | Get booking details by ID |

### Workspace & Resources

| Endpoint Path | HTTP Method | Query String Options / Request Body | API Version | Comments/Description |
|---------------|-------------|-------------------------------------|-------------|---------------------|
| `/user/favoriteResources` | GET | None | v1.1 | User's favorite resources/desks |
| `/user/favoriteResource` | PATCH | `{id: zoneId}` | v1.1 | Add a desk to user's favorites |
| `/user/favoriteResource/{zoneId}` | DELETE | None | v1.1 | Remove a desk from user's favorites |
| `/company/internalWorkspaces` | GET | `companyId`, `includeInactive` | v1.1 | Get internal workspaces for a company |
| `/company/internalWorkspaces/{workspaceId}/groups` | GET | None | v1.1 | Get groups for a workspace |
| `/company/internalWorkspaces/{workspaceId}/groups/{groupId}/floorConfig` | GET | None | v1.1 | Get floor configuration for a workspace group |
| `/internalWorkspaces/{workspaceId}/zones` | GET | `internal=true`, `startTime=timestamp` | v1.2 | Zone info including parking spaces |
| `/user/bookings/{workspaceId}/spaces` | GET | `date`, `startTime`, `endTime` | v1.1 | Get detailed booking and space info for a workspace on a specific date/time |

### Scheduling & Planning

| Endpoint Path | HTTP Method | Query String Options / Request Body | API Version | Comments/Description |
|---------------|-------------|-------------------------------------|-------------|---------------------|
| `/scheduling/list` | GET | `startDate`, `numberOfDays` | v2 | Get scheduling overview for multiple days with office status, bookings, and team presence |

### Company Administration

| Endpoint Path | HTTP Method | Query String Options / Request Body | API Version | Comments/Description |
|---------------|-------------|-------------------------------------|-------------|---------------------|
| `/businesscompany/{companyId}` | GET | None | v1.1 | Get comprehensive business company information including settings, integrations, and policies |

### Events & Miscellaneous

| Endpoint Path | HTTP Method | Query String Options / Request Body | API Version | Comments/Description |
|---------------|-------------|-------------------------------------|-------------|---------------------|
| `/events` | GET | None | v1.1 | Returns events (empty array) |

## Authentication Endpoints (Google Token API)

| Endpoint Path | HTTP Method | Query String Options | API Version | Comments/Description |
|---------------|-------------|---------------------|-------------|---------------------|
| `https://securetoken.googleapis.com/v1/token` | POST | `key` (API key) | v1 | Refresh OAuth access token using refresh token |

## Parameter Documentation by Feature

### User Management Parameters

#### User Search (`/users`)
- `searchQuery` (string, optional): Search term for finding users
- `companyId` (number, required): Company ID to search within
- `offset` (number, optional): Number of results to skip (default: 0)
- `limit` (number, optional): Maximum results to return (default: 30)
- `sortField` (string, optional): Field to sort by (default: "userName")
- `sortOrder` (string, optional): Sort order "ASC" or "DESC" (default: "ASC")
- `excludeUserIds` (string, optional): Comma-separated list of user IDs to exclude
- `followStatus` (string, optional): Filter by follow relationship - "following", "notFollowing", or omit for all users

### Booking Management Parameters

#### User Bookings (`/user/bookings`)
- `skip` (number, optional): Number of bookings to skip (default: 0)
- `limit` (number, optional): Maximum bookings to return (default: 10)
- `includeInstances` (boolean, optional): Include booking instances (default: true)
- `upcoming` (boolean, optional): Filter to upcoming bookings only (default: true)

#### User Workspace Spaces (`/user/bookings/{workspaceId}/spaces`)
- `date` (string, required): Date in YYYY-MM-DD format for which to get space information
- `startTime` (number, required): Unix timestamp in milliseconds for the start time
- `endTime` (number, required): Unix timestamp in milliseconds for the end time

### Workspace & Resources Parameters

#### Internal Workspaces (`/company/internalWorkspaces`)
- `companyId` (string, required): Company ID to get workspaces for
- `includeInactive` (boolean, optional): Include inactive workspaces (default: false)

#### Internal Workspace Zones (`/internalWorkspaces/{workspaceId}/zones`)
- `internal` (boolean, required): Set to true for internal workspace access
- `startTime` (number, required): Timestamp for zone availability calculation

### Scheduling & Planning Parameters

#### Scheduling List (`/scheduling/list`)
- `startDate` (string, required): Start date in YYYY-MM-DD format for the scheduling period
- `numberOfDays` (number, required): Number of days to retrieve scheduling information for (e.g., 21 for 3 weeks)

## Booking Creation Functionality

The `/bookings` POST endpoint supports creating both regular user bookings and guest bookings for visitor management.

### Regular User Booking

For standard desk bookings by registered users:

```json
{
  "bookings": [
    {
      "bookingStartTime": 1753246800000,
      "bookingEndTime": 1753304400000,
      "isAnonymous": false,
      "resourceId": "70645",
      "zoneItemId": 476809,
      "workspaceId": "6817"
    }
  ]
}
```

### Regular Booking Parameters

- `bookings` (array, required): Array of booking objects
  - `bookingStartTime` (number, required): Unix timestamp in milliseconds for booking start
  - `bookingEndTime` (number, required): Unix timestamp in milliseconds for booking end
  - `isAnonymous` (boolean, optional): Whether the booking should be anonymous (default: false)
  - `resourceId` (string, required): The resource/zone ID (e.g., "70645" for desk area)
  - `zoneItemId` (number, required): The specific desk/zone item ID to book (e.g., 476809 for Desk 58)
  - `workspaceId` (string, required): The workspace ID where the booking is made

### Guest User Booking

For booking desks for external guests and visitors:

```json
{
  "bookings": [
    {
      "guest": {
        "firstName": "John",
        "lastName": "Doe", 
        "email": "john.doe@example.com"
      },
      "bookingStartTime": 1753246800000,
      "bookingEndTime": 1753304400000,
      "zoneItemId": 476809,
      "isAnonymous": false
    }
  ]
}
```

### Guest Booking Parameters

- `bookings` (array, required): Array of booking objects
  - `guest` (object, required): Guest information
    - `firstName` (string, required): Guest's first name
    - `lastName` (string, required): Guest's last name  
    - `email` (string, required): Guest's email address
  - `bookingStartTime` (number, required): Unix timestamp in milliseconds for booking start
  - `bookingEndTime` (number, required): Unix timestamp in milliseconds for booking end
  - `zoneItemId` (number, required): The specific desk/zone item ID to book
  - `isAnonymous` (boolean, optional): Whether the booking should be anonymous (default: false)

**Note**: Guest bookings don't require `resourceId` or `workspaceId` as these are inferred from the `zoneItemId`.

### Booking Use Cases

This functionality enables:
- **Regular Desk Booking**: Standard workspace reservations for registered users
- **Quick Booking**: Fast desk reservation with minimal required fields
- **Visitor Management**: Book desks for external guests and visitors
- **Temporary Access**: Provide workspace access to non-employees
- **Event Coordination**: Reserve spaces for conference attendees or meeting participants
- **Contractor Support**: Allocate desks for temporary workers or consultants
- **Flexible Workspace Management**: Support both hot-desking and assigned seating models

## Booking Cancellation

The API provides multiple ways to cancel bookings depending on your needs.

### Method 1: PATCH `/bookings/{bookingId}/cancel`

This is the primary method for cancelling bookings.

**Request Structure:**
```bash
PATCH /v1.1/bookings/{bookingId}/cancel
Content-Type: application/json

{}
```

**Parameters:**
- `bookingId` (path parameter, required): The ID of the booking to cancel
- **Request Body**: Empty JSON object `{}`

**Usage Example:**
- URL: `/bookings/123456/cancel`
- Method: PATCH
- Body: `{}`

### Method 2: DELETE `/bookings/{bookingId}`

Alternative cancellation method using DELETE.

**Request Structure:**
```bash
DELETE /v1.1/bookings/{bookingId}
```

**Parameters:**
- `bookingId` (path parameter, required): The ID of the booking to cancel
- **Request Body**: None required

### Cancellation Capabilities

Both methods support:
- **User Booking Cancellation**: Cancel your own bookings
- **Guest Booking Cancellation**: Cancel bookings made for guests
- **Administrative Cancellation**: Cancel bookings on behalf of others (with proper permissions)
- **Bulk Operations**: Cancel multiple bookings by calling the endpoint multiple times

### Important Notes

- Cancellation policies may apply (check company settings for auto-cancellation rules)
- Some bookings may have restrictions based on timing or user permissions
- The booking status will be updated to reflect the cancellation
- Calendar events associated with the booking may also be cancelled if calendar sync is enabled

## Booking Updates

The API allows you to modify existing bookings to change times, extend duration, or update other booking details.

### PATCH `/bookings/{bookingId}`

Update an existing booking with new details.

**Request Structure:**
```bash
PATCH /v1.1/bookings/{bookingId}
Content-Type: application/json

{
  "bookingId": "123456",
  "bookingEndTime": 1753300800000
}
```

**Parameters:**
- `bookingId` (path parameter, required): The ID of the booking to update
- **Request Body**: Object containing fields to update

**Updatable Fields:**
- `bookingId` (string, required): Must match the booking ID in the URL path
- `bookingStartTime` (number, optional): New start time as Unix timestamp in milliseconds
- `bookingEndTime` (number, optional): New end time as Unix timestamp in milliseconds
- `isAnonymous` (boolean, optional): Update anonymity setting
- `zoneItemId` (number, optional): Change to a different desk/zone item

### Update Examples

**Extend Booking End Time:**
```json
{
  "bookingId": "123456",
  "bookingEndTime": 1753300800000
}
```

**Change Both Start and End Times:**
```json
{
  "bookingId": "123456", 
  "bookingStartTime": 1753243200000,
  "bookingEndTime": 1753300800000
}
```

**Move to Different Desk:**
```json
{
  "bookingId": "123456",
  "zoneItemId": 476810
}
```

### Update Capabilities

Booking updates support:
- **Time Extensions**: Extend or shorten booking duration
- **Time Shifts**: Move bookings to different time slots
- **Desk Changes**: Switch to a different available desk
- **Privacy Updates**: Change anonymity settings
- **Administrative Updates**: Modify bookings on behalf of others (with proper permissions)

### Important Notes

- Updates must comply with workspace booking policies and availability
- Some changes may require additional validation (e.g., desk availability for time changes)
- Calendar events will be updated automatically if calendar sync is enabled
- Users can typically only update their own bookings unless they have administrative permissions

## API Versioning Strategy

The SDK uses endpoint-specific versioning, where different endpoints can use different API versions:

- **v1.1**: Most common endpoints (user profile, bookings, favorites, workspaces)
- **v1.2**: Internal workspace zone information
- **v1.4**: Enhanced user corporate information  
- **v2**: Advanced scheduling and planning features
- **v3**: Newer user-related endpoints (user search, user details)

The versioning is handled automatically by the `getVersionedEndpoint()` utility function, which maps each endpoint to its appropriate API version.

## Test Results

✅ **Working Endpoints**: 19/19 endpoints tested successfully  
🎉 **All endpoints working**: All documented GET endpoints have been verified and are functional

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
  searchQuery: "doe",
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

## Additional Implementation Notes

The API provides comprehensive functionality across several key feature areas:

- **User Management**: Complete user profile management, search capabilities with social features (follow system), and corporate information access
- **Booking Management**: Full booking lifecycle support including creation (regular and guest bookings), updates (time changes, desk switches), and cancellation (multiple methods)
- **Workspace & Resources**: Physical space management including desk favorites, floor configurations, zone information, and detailed space availability
- **Scheduling & Planning**: Advanced scheduling features with multi-day overviews, team presence indicators, and booking summaries
- **Company Administration**: Business-level configuration including integrations (HRIS, calendar), office roles, privacy policies, and administrative settings
- **Events & Data**: Event system integration and miscellaneous data endpoints
