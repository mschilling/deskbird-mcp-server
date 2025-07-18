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

Create a `.env` file with the following variables:

```env
REFRESH_TOKEN=your_deskbird_refresh_token
GOOGLE_API_KEY=your_google_api_key
DESKBIRD_RESOURCE_ID=your_resource_id
DESKBIRD_ZONE_ITEM_ID=your_zone_item_id
DESKBIRD_WORKSPACE_ID=your_workspace_id
```

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
- `resource_id` (optional): Specific desk/resource ID
- `workspace_id` (optional): Workspace ID
- `zone_item_id` (optional): Zone item ID

**Example:**
```json
{
  "date": "2025-07-18"
}
```

## How it Works

1. Validates environment configuration
2. Refreshes access tokens using Google API
3. Handles date validation (skips weekends)
4. Creates booking through Deskbird API
5. Returns success/failure status with details

## Requirements

- Node.js 22+ (see `.nvmrc`)
- Valid Deskbird account and API credentials
- Google API key for token refresh

## License

ISC License - see [LICENSE](LICENSE) file for details.

## Author

[@mschilling](https://github.com/mschilling)
