# Deskbird MCP Server

A Model Context Protocol (MCP) server for Deskbird desk booking integration. This server enables AI assistants to book office desks through the Deskbird API.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration) 
- [Usage](#usage)
- [Available Tools](#available-tools)
- [How it Works](#how-it-works)
- [Requirements](#requirements)
- [Deskbird SDK (For Developers)](#deskbird-sdk-for-developers)
- [API Endpoints Reference](#api-endpoints-reference)
- [License](#license)

## Features

- 📅 **Desk Booking**: Book office desks for specific dates with automatic date validation
- 🏢 **Workspace Management**: Access workspace and zone-specific booking with auto-discovery
- ⭐ **Favorites Management**: Add/remove desks to/from favorites by desk number
- 👥 **User Management**: Search users, get user details, and profile information
- 🔧 **Configurable**: Environment-based configuration with sensible defaults
- 🚀 **Modern Stack**: Built with TypeScript, MCP SDK, and comprehensive Deskbird SDK
- 🛡️ **Error Handling**: Comprehensive error handling with business exception support
- 🌐 **API Versioning**: Intelligent API versioning with endpoint-specific version selection

## Installation

```bash
npm install
```

## Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
REFRESH_TOKEN=your_deskbird_refresh_token
GOOGLE_API_KEY=your_google_api_key
DESKBIRD_RESOURCE_ID=your_resource_id
DESKBIRD_ZONE_ITEM_ID=your_zone_item_id
DESKBIRD_WORKSPACE_ID=your_workspace_id
DEFAULT_COMPANY_ID=your_company_id  # Optional: If not set, will be auto-discovered from user profile
```

### Dynamic Company ID Resolution

The MCP server automatically handles company ID resolution in the following priority order:

1. **Environment Variable**: If `DEFAULT_COMPANY_ID` is set in your environment file, it will be used
2. **Auto-Discovery**: If no environment variable is set, the server will automatically discover your company ID from your user profile
3. **Explicit Parameter**: Individual tool calls can still override the company ID by passing it explicitly

This ensures the server works across different companies and environments without requiring hardcoded values.

## Usage

### Build and Run

```bash
npm run build
npm start
```

### Development

```bash
npm run dev
```

## Available Tools

The MCP server provides 10 tools that interact with various Deskbird API endpoints. Each tool is designed for specific use cases while the `deskbird_api_call` tool provides direct API access for advanced scenarios.

### Overview of Tools by Category

#### 🏢 **Desk Management**
- [`deskbird_book_desk`](#deskbird_book_desk) - Book a specific desk for a date
- [`deskbird_get_available_desks`](#deskbird_get_available_desks) - List all available desks

#### ⭐ **Favorites Management**  
- [`deskbird_favorite_desk`](#deskbird_favorite_desk) - Add desk to favorites
- [`deskbird_unfavorite_desk`](#deskbird_unfavorite_desk) - Remove desk from favorites
- [`deskbird_get_user_favorites`](#deskbird_get_user_favorites) - Get user's favorite desks

#### 📅 **Booking Management**
- [`deskbird_get_user_bookings`](#deskbird_get_user_bookings) - Get user's current bookings

#### 👥 **User Management**
- [`deskbird_get_user_info`](#deskbird_get_user_info) - Get current user profile
- [`deskbird_search_users`](#deskbird_search_users) - Search for users in company
- [`deskbird_get_user_details`](#deskbird_get_user_details) - Get detailed user information

#### 🔧 **Advanced/Debug**
- [`deskbird_api_call`](#deskbird_api_call-️-preview-tool) - Direct API access (Preview Tool)

### `deskbird_book_desk`

Books a desk at the office for a specific date.

**Parameters:**
- `date` (required): The date to book in YYYY-MM-DD format
- `desk_id` (required): The ID of the specific desk (zone item ID) to book

**Example:**
```json
{
  "date": "2025-07-18",
  "desk_id": 123
}
```

### `deskbird_get_user_bookings`

Retrieves a list of the current user's desk bookings with optional filtering.

**Parameters:**
- `skip` (optional): Number of bookings to skip for pagination. Defaults to 0
- `limit` (optional): Maximum number of bookings to return. Defaults to 10
- `include_instances` (optional): Whether to include booking instances. Defaults to true
- `upcoming` (optional): Filter to show only upcoming bookings. Defaults to true

### `deskbird_favorite_desk`

Adds a desk to the user's favorite desks list.

**Parameters:**
- `desk_id` (required): The desk number (e.g., 57 for Desk 57)

### `deskbird_unfavorite_desk`

Removes a desk from the user's favorite desks list.

**Parameters:**
- `desk_id` (required): The desk number (e.g., 57 for Desk 57)

### `deskbird_get_user_favorites`

Retrieves the user's current favorite desks list with desk details including names, locations, and IDs.

### `deskbird_get_user_info`

Retrieves the current user's profile information including name, office, settings, and account details.

### `deskbird_get_available_desks`

Retrieves a list of all available desks from the floor configuration. Shows both desk numbers (used for favoriting) and internal resource IDs.

### `deskbird_search_users`

Search for users within the company by name, email, or other criteria.

**Parameters:**
- `search_query` (required): Search query to find users (searches names, emails, etc.)
- `limit` (optional): Maximum number of results to return. Defaults to 30
- `offset` (optional): Number of results to skip for pagination. Defaults to 0
- `company_id` (optional): Company ID to search within. If not specified, will be auto-discovered from your user profile or use DEFAULT_COMPANY_ID environment variable if set
- `exclude_user_ids` (optional): Comma-separated list of user IDs to exclude from results
- `sort_field` (optional): Field to sort by. Defaults to "userName"
- `sort_order` (optional): Sort order ("ASC" or "DESC"). Defaults to "ASC"

**Example:**
```json
{
  "search_query": "cas",
  "limit": 10
}
```

### `deskbird_get_user_details`

Get detailed information about a specific user by their user ID.

**Parameters:**
- `user_id` (required): The ID of the user to retrieve details for

**Example:**
```json
{
  "user_id": "12345"
}
```

### `deskbird_api_call` ⚠️ PREVIEW TOOL

Execute any HTTP request to the Deskbird API with full control over path, method, headers, and body. This tool provides direct access to the Deskbird API for advanced users, debugging, and accessing endpoints not covered by dedicated tools.

**⚠️ Security and Usage Considerations:**
- This tool provides unrestricted access to the Deskbird API
- Use only if you understand the API structure and potential consequences  
- Be mindful of API rate limits and data validation
- For production use, prefer dedicated tools when available

**Parameters:**
- `method` (required): HTTP method - one of: GET, POST, PUT, PATCH, DELETE
- `path` (required): API endpoint path without base URL (e.g., "/user", "/bookings")
- `api_version` (optional): API version to use. Defaults to "v1.1". Examples: "v1.1", "v3"
- `body` (optional): Request body for POST/PUT/PATCH requests
- `query_params` (optional): URL query parameters as key-value pairs
- `headers` (optional): Additional HTTP headers (Authorization is automatically added)

**Common Use Cases:**
- **Guest Bookings**: Create bookings for external visitors
- **Booking Updates**: Modify existing booking times or details
- **Advanced Search**: Access search endpoints with specific filters
- **Administrative Actions**: Company-level operations
- **Debugging**: Test API responses and troubleshoot issues

**Examples:**

Get current user information:
```json
{
  "method": "GET",
  "path": "/user"
}
```

Search users with custom parameters:
```json
{
  "method": "GET",
  "path": "/users",
  "api_version": "v3",
  "query_params": {
    "searchQuery": "john",
    "limit": 10,
    "sortField": "userName",
    "sortOrder": "ASC"
  }
}
```

Create a guest booking:
```json
{
  "method": "POST",
  "path": "/bookings",
  "body": {
    "bookings": [
      {
        "guest": {
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane.smith@external.com"
        },
        "bookingStartTime": 1703854800000,
        "bookingEndTime": 1703883600000,
        "zoneItemId": 123,
        "isAnonymous": false
      }
    ]
  }
}
```

Update an existing booking:
```json
{
  "method": "PATCH", 
  "path": "/bookings/12345",
  "body": {
    "bookingId": "12345",
    "bookingEndTime": 1703890800000
  }
}
```

Cancel a booking:
```json
{
  "method": "PATCH",
  "path": "/bookings/12345/cancel",
  "body": {}
}
```

**Reference**: See [API_ENDPOINTS.md](API_ENDPOINTS.md) for complete API documentation including all available endpoints, parameters, and response formats.

## How it Works

The Deskbird MCP Server integrates multiple layers to provide seamless desk booking functionality:

### Architecture Overview

1. **MCP Layer**: Provides 10 standardized tools for common desk booking operations
2. **SDK Layer**: Comprehensive TypeScript SDK with modular API clients
3. **API Layer**: Direct integration with Deskbird's REST API endpoints
4. **Authentication**: Automatic OAuth token refresh using Google API

### Request Flow

1. **Tool Invocation**: AI assistant calls one of the 10 MCP tools
2. **Parameter Validation**: Validates input parameters and business rules (e.g., no weekend bookings)
3. **SDK Processing**: Routes request through appropriate SDK API client
4. **Authentication**: Automatically refreshes access tokens as needed
5. **API Communication**: Makes authenticated requests to Deskbird API endpoints
6. **Response Processing**: Handles responses, errors, and business exceptions
7. **Result Formatting**: Returns structured data to the AI assistant

### Smart Defaults and Auto-Discovery

- **Company ID**: Auto-discovers from user profile if not configured
- **Workspace/Group IDs**: Can be auto-discovered or set via environment variables
- **Date Validation**: Automatically skips weekends and validates future dates
- **Desk Resolution**: Converts user-friendly desk numbers to internal zone IDs
- **API Versioning**: Automatically selects appropriate API version for each endpoint

## Requirements

- **Node.js 22+** (see `.nvmrc` for exact version)
- **Valid Deskbird account** with API credentials
- **Google API key** for OAuth token refresh
- **Environment Configuration** (see [Configuration](#configuration) section)

### Build and Test

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run in production mode
npm start

# Inspect MCP server (useful for debugging)
npm run inspector
```

The project uses TypeScript and compiles to the `dist/` directory. No automated tests are currently available, but the build process will catch type errors and basic syntax issues.

## Deskbird SDK (For Developers)

The Deskbird SDK is a standalone TypeScript library designed for direct integration with the Deskbird API. It provides a clean, type-safe, and extensible architecture with features like automatic token refresh, comprehensive error handling, and date utilities.

**Key SDK Features:**
- 🏗️ **Modular Architecture**: Separate API clients for auth, bookings, user, favorites, and workspaces
- 🔐 **Authentication Management**: Automatic OAuth token refresh
- 🛡️ **Error Handling**: Business exception handling with structured error responses  
- 📅 **Date Utilities**: Built-in date validation and timezone support
- 🎯 **Production Ready**: Optimized for third-party API consumers
- 📦 **Factory Pattern**: Easy client creation with `createDeskbirdClient()`

If you are a developer looking to integrate with the Deskbird API directly in your application, you can find detailed documentation, installation instructions, and API references in the [SDK's dedicated README file](src/sdk/README.md).

## API Endpoints Reference

The MCP server leverages 19+ Deskbird API endpoints across multiple versions (v1.1, v1.2, v1.4, v2, v3). The available tools map to these endpoints as follows:

### MCP Tool to API Endpoint Mapping

| MCP Tool | Primary API Endpoints | API Version | Notes |
|----------|----------------------|-------------|-------|
| `deskbird_book_desk` | `POST /bookings` | v1.1 | Creates desk bookings with date validation |
| `deskbird_get_user_bookings` | `GET /user/bookings` | v1.1 | Supports pagination and filtering |
| `deskbird_favorite_desk` | `PATCH /user/favoriteResource` | v1.1 | Adds desk to favorites by zone ID |
| `deskbird_unfavorite_desk` | `DELETE /user/favoriteResource/{zoneId}` | v1.1 | Removes desk from favorites |
| `deskbird_get_user_favorites` | `GET /user/favoriteResources` | v1.1 | Lists user's favorite desks |
| `deskbird_get_user_info` | `GET /user` | v1.1 | Current user profile and preferences |
| `deskbird_get_available_desks` | `GET /company/internalWorkspaces/.../floorConfig` | v1.1 | Floor configuration and desk layout |
| `deskbird_search_users` | `GET /users` | v3 | Company user search with filters |
| `deskbird_get_user_details` | `GET /users/{userId}` | v3 | Detailed user information |
| `deskbird_api_call` | **Any endpoint** | **Any version** | Direct API access for all operations |

### Advanced API Operations (via `deskbird_api_call`)

For operations not covered by dedicated tools, use `deskbird_api_call`:

- **Guest Bookings**: `POST /bookings` with guest data
- **Booking Updates**: `PATCH /bookings/{id}` for time changes
- **Booking Cancellation**: `PATCH /bookings/{id}/cancel` or `DELETE /bookings/{id}`
- **Scheduling Overview**: `GET /scheduling/list` (v2) for multi-day planning
- **Company Information**: `GET /businesscompany/{id}` for admin data
- **Workspace Details**: Various workspace and zone endpoints

For complete API documentation including request/response schemas, parameters, and examples, see **[API_ENDPOINTS.md](API_ENDPOINTS.md)**.

## License

ISC License - see [LICENSE](LICENSE) file for details.

## Author

[@mschilling](https://github.com/mschilling)
