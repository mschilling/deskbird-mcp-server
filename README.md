# Deskbird MCP Server

A Model Context Protocol (MCP) server for Deskbird desk booking integration. This server enables AI assistants to book office desks through the Deskbird API.

## Features

- 📅 Book office desks for specific dates
- 🏢 Workspace and zone-specific booking
- 🔧 Configurable through environment variables
- 🚀 Built with TypeScript and MCP SDK

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

Execute any HTTP request to the Deskbird API with full control over path, method, headers, and body. This tool provides direct access to the Deskbird API for advanced users and debugging.

**⚠️ Security Considerations:**
- This tool provides unrestricted access to the Deskbird API
- Use only if you understand the API structure and potential consequences
- Be mindful of API rate limits
- Validate all inputs before execution

**Parameters:**
- `method` (required): HTTP method - one of: GET, POST, PUT, PATCH, DELETE
- `path` (required): API endpoint path without base URL (e.g., "/user", "/bookings")
- `api_version` (optional): API version to use. Defaults to "v1.1". Examples: "v1.1", "v3"
- `body` (optional): Request body for POST/PUT/PATCH requests
- `query_params` (optional): URL query parameters as key-value pairs
- `headers` (optional): Additional HTTP headers (Authorization is automatically added)

**Examples:**
```json
{
  "method": "GET",
  "path": "/user"
}
```

```json
{
  "method": "GET",
  "path": "/user/bookings",
  "query_params": {
    "limit": 5,
    "upcoming": true
  }
}
```

```json
{
  "method": "GET",
  "path": "/some-endpoint",
  "api_version": "v3"
}
```

```json
{
  "method": "POST",
  "path": "/bookings",
  "body": {
    "bookings": [
      {
        "bookingStartTime": 1656576000000,
        "bookingEndTime": 1656608400000,
        "isAnonymous": false,
        "resourceId": "abc123",
        "zoneItemId": 456,
        "workspaceId": "workspace123"
      }
    ]
  }
}
```

## How it Works

1. Validates environment configuration
2. Refreshes access tokens using Google API
3. Handles date validation (skips weekends)
4. Creates booking through Deskbird API
5. Returns success/failure status with details

## Requirements

- **Node.js 22+** (see `.nvmrc` for exact version)
- Valid Deskbird account and API credentials
- Google API key for token refresh

## Deskbird SDK (For Developers)

The Deskbird SDK is a standalone TypeScript library designed for direct integration with the Deskbird API. It provides a clean, type-safe, and extensible architecture with features like automatic token refresh, comprehensive error handling, and date utilities.

If you are a developer looking to integrate with the Deskbird API directly in your application, you can find detailed documentation, installation instructions, and API references in the [SDK's dedicated README file](src/sdk/README.md).

## License

ISC License - see [LICENSE](LICENSE) file for details.

## Author

[@mschilling](https://github.com/mschilling)
