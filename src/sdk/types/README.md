# SDK Types

This directory contains the organized TypeScript type definitions for the Deskbird MCP Server SDK. The types are organized by domain for better maintainability and discoverability.

## File Organization

### `core.ts`
Core domain types related to workspaces, resources, zones, and office infrastructure:
- `Workspace` - Office workspace configuration
- `Resource` - Bookable resources (desks, meeting rooms, etc.)
- `ZoneItem` - Individual items within zones
- `Group` - Resource groupings
- `Address`, `OpeningHours`, `WorkspaceSettings` - Supporting types

### `user.ts`  
User-related types and favorites management:
- `User`, `UserData` - User profile and account information
- `FavoriteResource`, `FavoriteDesk` - User favorites
- `UserResponse` - API response types
- Supporting types for user settings, roles, etc.

### `bookings.ts`
Booking-related types:
- `Booking` - Booking entity and status
- `BookingResponse`, `BookingsListResponse` - API responses
- `CreateBookingRequest`, `CreateBookingResponse` - Booking creation

### `tools.ts`
MCP tool-specific parameter and result types:
- Tool parameter interfaces (`BookDeskParams`, `GetUserBookingsParams`, etc.)
- Tool result types (`ToolResult`, `GetUserBookingsResult`)
- Generic API call types (`DeskbirdApiCallParams`, `DeskbirdApiCallResponse`)

### `api.ts`
Generic API infrastructure types:
- `ApiResponse<T>` - Generic API response wrapper
- `PaginatedResponse<T>` - Paginated response structure  
- `PaginationInfo` - Pagination metadata
- `HttpMethod`, `ApiCallParams` - HTTP client types

### `auth.ts`
Authentication and authorization types (imported from existing auth module).

### `index.ts`
Re-exports all types from the organized modules for convenient importing.

## Usage

Import types from the organized modules:

```typescript
// Import specific domain types
import type { User, UserData } from './sdk/types/user.js';
import type { Booking, BookingResponse } from './sdk/types/bookings.js';
import type { Workspace, Resource } from './sdk/types/core.js';

// Or import everything from the index
import type { User, Booking, Workspace } from './sdk/types/index.js';
```

## Backward Compatibility

The main `src/types.ts` file re-exports all types from this organized structure to maintain backward compatibility with existing code.
