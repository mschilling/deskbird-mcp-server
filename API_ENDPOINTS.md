# Deskbird API Endpoints Documentation

This document provides a comprehensive overview of all Deskbird API endpoints available through the Deskbird MCP Server and SDK. It serves as both a reference for the `deskbird_api_call` tool and documentation of the underlying API structure.

## Quick Navigation

- [MCP Tool Integration](#mcp-tool-integration) - How API endpoints map to MCP tools
- [API Base Configuration](#api-base-configuration) - Base URLs, authentication, timeouts
- [Endpoints Overview](#endpoints-overview) - Complete endpoint reference tables
- [Booking Operations](#booking-creation-functionality) - Detailed booking workflows
- [SDK Coverage](#sdk-coverage) - Which endpoints are covered by the SDK

## MCP Tool Integration

The Deskbird MCP Server provides 10 tools that abstract common API operations. Here's how they map to the underlying API endpoints:

### Dedicated MCP Tools

| MCP Tool | API Endpoint(s) | Version | Description |
|----------|----------------|---------|-------------|
| `deskbird_book_desk` | `POST /bookings` | v1.1 | Book a desk for specific date with auto-validation |
| `deskbird_get_user_bookings` | `GET /user/bookings` | v1.1 | Get user's bookings with pagination |
| `deskbird_favorite_desk` | `PATCH /user/favoriteResource` | v1.1 | Add desk to favorites by desk number |
| `deskbird_unfavorite_desk` | `DELETE /user/favoriteResource/{zoneId}` | v1.1 | Remove desk from favorites |
| `deskbird_get_user_favorites` | `GET /user/favoriteResources` | v1.1 | List user's favorite desks |
| `deskbird_get_user_info` | `GET /user` | v1.1 | Get current user profile and settings |
| `deskbird_get_available_desks` | `GET /company/internalWorkspaces/{id}/groups/{id}/floorConfig` | v1.1 | Get all desks from floor configuration |
| `deskbird_search_users` | `GET /users` | v3 | Search company users with filters |
| `deskbird_get_user_details` | `GET /users/{userId}` | v3 | Get detailed user information |

### Advanced Operations (via `deskbird_api_call` only)

| Operation | API Endpoint(s) | Version | Description |
|-----------|----------------|---------|-------------|
| Guest Bookings | `POST /bookings` | v1.1 | Create bookings for external visitors |
| Booking Updates | `PATCH /bookings/{id}` | v1.1 | Modify existing booking times/details |
| Booking Cancellation | `PATCH /bookings/{id}/cancel`, `DELETE /bookings/{id}` | v1.1 | Cancel bookings (two methods available) |
| Scheduling Overview | `GET /scheduling/list` | v2 | Multi-day scheduling with team presence |
| Company Administration | `GET /businesscompany/{id}` | v1.1 | Business settings and integrations |
| Corporate Info | `GET /user/corporateInfo` | v1.4 | Enhanced company information |
| Workspace Zones | `GET /internalWorkspaces/{id}/zones` | v1.2 | Zone info including parking spaces |
| Booking Spaces Detail | `GET /user/bookings/{workspaceId}/spaces` | v1.1 | Detailed booking and space info |

**💡 Tip**: Use dedicated MCP tools for common operations. Use `deskbird_api_call` for advanced scenarios, guest bookings, administrative tasks, or operations not covered by dedicated tools.

**⚠️ Note**: The `deskbird_api_call` tool is a preview feature that must be explicitly enabled by setting `ENABLE_PREVIEW_TOOLS=true` in your environment configuration. It is disabled by default for security reasons.

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

## Using `deskbird_api_call` with These Endpoints

The `deskbird_api_call` MCP tool provides direct access to all documented endpoints. 

**⚠️ Prerequisites**: This tool must be explicitly enabled by setting `ENABLE_PREVIEW_TOOLS=true` in your environment configuration. See the [Configuration Guide](README.md#preview-tools-configuration) for setup instructions.

Here are some practical examples:

### Quick Examples

**Get user corporate information:**
```json
{
  "method": "GET",
  "path": "/user/corporateInfo",
  "api_version": "v1.4"
}
```

**Get scheduling overview for 3 weeks:**
```json
{
  "method": "GET", 
  "path": "/scheduling/list",
  "api_version": "v2",
  "query_params": {
    "startDate": "2025-01-20",
    "numberOfDays": 21
  }
}
```

**Create guest booking:**
```json
{
  "method": "POST",
  "path": "/bookings", 
  "body": {
    "bookings": [{
      "guest": {
        "firstName": "Alice",
        "lastName": "Johnson", 
        "email": "alice@external.com"
      },
      "bookingStartTime": 1737709200000,
      "bookingEndTime": 1737738000000,
      "zoneItemId": 12345,
      "isAnonymous": false
    }]
  }
}
```

**Update booking end time:**
```json
{
  "method": "PATCH",
  "path": "/bookings/67890",
  "body": {
    "bookingId": "67890",
    "bookingEndTime": 1737741600000
  }
}
```

**Create booking with error handling:**
```json
{
  "method": "POST",
  "path": "/bookings",
  "body": {
    "bookings": [{
      "bookingStartTime": 1753340400000,
      "bookingEndTime": 1753369200000,
      "isAnonymous": false,
      "resourceId": "70645",
      "workspaceId": "6817", 
      "zoneItemId": 476804
    }]
  }
}
```

**Search users in different company:**
```json
{
  "method": "GET",
  "path": "/users",
  "api_version": "v3",
  "query_params": {
    "searchQuery": "smith",
    "companyId": 2927,
    "limit": 25,
    "sortOrder": "DESC"
  }
}
```

### Parameter Validation

When using `deskbird_api_call`, ensure:
- **API Version**: Use correct version for each endpoint (see [API Versioning Strategy](#api-versioning-strategy))
- **Timestamps**: Use Unix timestamps in milliseconds for booking times
  - Convert local time to UTC milliseconds: `new Date('2025-07-24T09:00:00+02:00').getTime()`
  - Verify with: `new Date(timestamp).toISOString()` 
- **Company IDs**: Numeric company IDs (auto-discovered by default)
- **Zone/Resource IDs**: Use actual zone item IDs, not desk numbers
- **Required Fields**: Include all required parameters for each endpoint
- **Anonymous Bookings**: Check workspace `allowsAnonymousBooking` setting before attempting
- **Office Hours**: Ensure booking times fall within workspace `openingHours`

**Pro Tip**: Always test your timestamp calculations in your local timezone before making API calls. A common issue is using seconds instead of milliseconds, or not accounting for timezone differences.

For full parameter details and schemas, see the dedicated sections below.

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

### Important Booking Considerations

#### Anonymous Bookings
- **Workspace Policy**: Anonymous bookings are controlled by the workspace setting `allowsAnonymousBooking`
- **Check Before Booking**: If this setting is `false`, requests with `isAnonymous: true` will fail with a 403 Forbidden error
- **Fallback Strategy**: When anonymous booking fails, create a regular booking instead

#### Timezone and Timestamps
- **Format**: All timestamps must be Unix timestamps in milliseconds (not seconds)
- **Timezone Handling**: Timestamps should account for the workspace's timezone
- **Example Calculation**: For Amsterdam timezone (Europe/Amsterdam, UTC+2 in summer):
  ```javascript
  // 9:00 AM Amsterdam time = 7:00 AM UTC
  const startTime = new Date('2025-07-24T09:00:00+02:00').getTime(); // 1753340400000
  const endTime = new Date('2025-07-24T17:00:00+02:00').getTime();   // 1753369200000
  ```
- **Office Hours**: Ensure booking times fall within the workspace's `openingHours` configuration

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

**Note**: Guest bookings don't require `resourceId` or `workspaceId` as these are inferred from the `zoneItemId`. However, the same anonymous booking restrictions apply - check workspace settings first.

### Booking Use Cases

This functionality enables:
- **Regular Desk Booking**: Standard workspace reservations for registered users
- **Quick Booking**: Fast desk reservation with minimal required fields
- **Visitor Management**: Book desks for external guests and visitors
- **Temporary Access**: Provide workspace access to non-employees
- **Event Coordination**: Reserve spaces for conference attendees or meeting participants
- **Contractor Support**: Allocate desks for temporary workers or consultants
- **Flexible Workspace Management**: Support both hot-desking and assigned seating models

### Common Booking Errors and Solutions

#### 403 Forbidden Error
- **Anonymous Booking Disabled**: Check workspace settings for `allowsAnonymousBooking: false`
- **Solution**: Create regular booking instead of anonymous booking
- **Check Settings**: Use `GET /user` to see workspace `settings.allowsAnonymousBooking`

#### 400 Bad Request - "Invalid booking start and end time"
- **Incorrect Timestamp Format**: Ensure using milliseconds, not seconds
- **Timezone Issues**: Timestamps may not account for local timezone
- **Outside Office Hours**: Check workspace `openingHours` configuration
- **Solution**: Convert local time to proper UTC millisecond timestamps

#### Missing Required Fields
- **Regular Bookings**: Must include `resourceId`, `workspaceId`, `zoneItemId`
- **Guest Bookings**: Must include `guest` object, can omit `resourceId`/`workspaceId`
- **Solution**: Check workspace configuration to get required IDs

#### Example: Debugging Timestamp Issues
```javascript
// Wrong: Using seconds instead of milliseconds
const wrongTime = Math.floor(Date.now() / 1000); // ❌

// Correct: Using milliseconds with timezone awareness
const correctStart = new Date('2025-07-24T09:00:00+02:00').getTime(); // ✅
const correctEnd = new Date('2025-07-24T17:00:00+02:00').getTime();   // ✅

// Verify readable format
console.log(new Date(correctStart).toISOString()); // Should show expected UTC time
```

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

## SDK Coverage

The Deskbird SDK provides comprehensive coverage of the API endpoints through modular clients:

### AuthApi (`src/sdk/api/auth.api.ts`)
- **Token Management**: Automatic OAuth token refresh using Google API
- **Authentication**: Handles all authentication workflows

### UserApi (`src/sdk/api/user.api.ts`)  
- **Profile Management**: `GET /user` for current user information
- **User Search**: `GET /users` (v3) with advanced filtering
- **User Details**: `GET /users/{userId}` (v3) for individual user data

### BookingsApi (`src/sdk/api/bookings.api.ts`)
- **Booking Creation**: `POST /bookings` with regular and guest booking support
- **Booking Retrieval**: `GET /user/bookings` with pagination and filtering
- **Booking Management**: Cancel and update operations

### FavoritesApi (`src/sdk/api/favorites.api.ts`)
- **Favorites Management**: `GET`, `PATCH`, `DELETE` operations for favorite desks
- **Smart Mapping**: Converts desk numbers to zone IDs automatically

### WorkspacesApi (`src/sdk/api/workspaces.api.ts`)
- **Workspace Discovery**: `GET /company/internalWorkspaces` 
- **Floor Configuration**: Parse floor config for desk information
- **Desk Mapping**: Convert desk numbers to zone IDs and vice versa

### High-Level SDK Methods
The SDK also provides convenience methods that combine multiple API calls:
- `bookDesk()` - Book desk by number (finds zone ID automatically)
- `getAvailableDesks()` - Get all desks with auto-discovery
- `favoriteDeskByNumber()` - Favorite by desk number (not zone ID)
- `apiCall()` - Generic method for any API endpoint

**Note**: All endpoints are available through the SDK, either via dedicated clients or the generic `apiCall()` method.

### SDK Methods Not Directly Exposed as MCP Tools

The SDK includes additional convenience methods that combine multiple API calls or provide enhanced functionality:

| SDK Method | Description | Available via MCP |
|------------|-------------|-------------------|
| `getUpcomingBookings()` | Get upcoming bookings with smart defaults | ✅ `deskbird_get_user_bookings` with `upcoming: true` |
| `getUserProfile()` | Simplified user profile (subset of full user data) | ✅ `deskbird_get_user_info` (returns full profile) |
| `toggleFavorite()` | Smart toggle favorite status | ✅ Use `deskbird_favorite_desk` / `deskbird_unfavorite_desk` |
| `discoverWorkspaceId()` | Auto-discover workspace ID | 🔧 Internal method used by other tools |
| `discoverGroupId()` | Auto-discover group ID | 🔧 Internal method used by other tools |
| `findDeskZoneId()` | Find zone ID by desk number | 🔧 Internal method used by booking tools |
| `validateToken()` | Check token validity | 🔧 Internal authentication method |

**Note**: Most SDK convenience methods are used internally by MCP tools to provide smart defaults and auto-discovery features.

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

### Integration Architecture  
- **MCP Layer**: 10 specialized tools for common operations with smart defaults
- **SDK Layer**: 5 modular API clients with automatic discovery and error handling  
- **API Layer**: 19+ endpoints across versions v1.1, v1.2, v1.4, v2, and v3
- **Authentication**: Seamless OAuth token management via Google API

### Development Workflow
1. **Use Dedicated Tools First**: Start with specific MCP tools (`deskbird_book_desk`, etc.)
2. **Advanced Operations**: Use `deskbird_api_call` for complex scenarios
3. **SDK Integration**: For direct application integration, use the TypeScript SDK
4. **API Documentation**: Reference this document for endpoint details and parameters

### Feature Coverage
- **User Management**: Complete user profile management, search capabilities with social features (follow system), and corporate information access
- **Booking Management**: Full booking lifecycle support including creation (regular and guest bookings), updates (time changes, desk switches), and cancellation (multiple methods)
- **Workspace & Resources**: Physical space management including desk favorites, floor configurations, zone information, and detailed space availability
- **Scheduling & Planning**: Advanced scheduling features with multi-day overviews, team presence indicators, and booking summaries
- **Company Administration**: Business-level configuration including integrations (HRIS, calendar), office roles, privacy policies, and administrative settings
- **Events & Data**: Event system integration and miscellaneous data endpoints

### Cross-References
- **MCP Tools**: See [README.md](README.md) for detailed MCP tool documentation
- **SDK Documentation**: See [src/sdk/README.md](src/sdk/README.md) for SDK integration guide
- **Authentication**: OAuth setup and Google API key configuration in main README
- **Examples**: Practical `deskbird_api_call` examples throughout this document
