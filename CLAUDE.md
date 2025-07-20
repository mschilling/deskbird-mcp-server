# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `npm run build` - Compiles TypeScript to `dist/` directory
- **Start**: `npm start` - Runs the compiled server from `dist/main.js`  
- **Development**: `npm run dev` - Builds and runs the server in one command

Note: There are no test or lint commands configured in this project.

## Project Architecture

This is a Model Context Protocol (MCP) server that integrates with the Deskbird desk booking API. The server exposes one primary tool for booking office desks.

### Core Structure

- **Entry Point**: `src/main.ts` - Sets up stdio transport and handles server lifecycle
- **Server Implementation**: `src/deskbird.server.ts` - Contains the main `DeskbirdMcpServer` class

### Key Components

**DeskbirdMcpServer Class**:
- Implements MCP server using `@modelcontextprotocol/sdk`
- Registers one tool: `deskbird_book_desk`
- Handles tool execution with error handling and validation

**Tool: deskbird_book_desk**:
- Books office desks for specific dates
- Validates date format and skips weekends automatically
- Uses environment variables for default booking parameters
- Integrates with Google token refresh API and Deskbird booking API

### Authentication Flow

1. Uses refresh token from environment to get fresh access token via Google API
2. Uses access token to authenticate with Deskbird API
3. Required environment variables: `REFRESH_TOKEN`, `GOOGLE_API_KEY`

### Configuration

Required environment variables in `.env`:
- `REFRESH_TOKEN` - Deskbird refresh token
- `GOOGLE_API_KEY` - Google API key for token refresh  
- `DESKBIRD_RESOURCE_ID` - Default desk/resource ID
- `DESKBIRD_ZONE_ITEM_ID` - Default zone item ID
- `DESKBIRD_WORKSPACE_ID` - Default workspace ID

### API Integration

- **Google Token API**: `https://securetoken.googleapis.com/v1/token` - Token refresh
- **Deskbird API**: `https://api.deskbird.com/v1.1/bookings` - Desk booking

### Date Handling

- Uses Luxon library with Europe/Amsterdam timezone
- Default booking hours: 9:00 AM to 6:00 PM
- Automatically skips weekend bookings (Saturday/Sunday)