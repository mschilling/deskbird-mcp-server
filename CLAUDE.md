# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `npm run build` - Compiles TypeScript to `dist/` directory
- **Start**: `npm start` - Runs the compiled server from `dist/main.js`  
- **Development**: `npm run dev` - Builds and runs the server in one command

Note: There are no test or lint commands configured in this project.

## Project Architecture

This is a Model Context Protocol (MCP) server that integrates with the Deskbird desk booking API. The server exposes 13+ tools for comprehensive desk booking, user management, and workspace interactions.

### Core Structure

- **Entry Point**: `src/main.ts` - Sets up stdio transport and handles server lifecycle
- **Server Implementation**: `src/deskbird.server.ts` - Contains the main `DeskbirdMcpServer` class

### Key Components

**DeskbirdMcpServer Class**:
- Implements MCP server using `@modelcontextprotocol/sdk`
- Registers 13+ tools for desk booking, user management, and workspace operations
- Handles tool execution with comprehensive error handling and validation
- Uses custom Logger class for protocol-compliant logging

**Key Tools Available**:
- `deskbird_book_desk` - Book office desks for specific dates
- `deskbird_get_user_bookings` - Retrieve user's current bookings
- `deskbird_favorite_desk` / `deskbird_unfavorite_desk` - Manage favorite desks
- `deskbird_get_user_info` - Get current user profile information
- `deskbird_search_users` - Search for company users
- `deskbird_get_staff_planning` - View team scheduling
- `deskbird_get_zone_availability` - Real-time desk occupancy and availability
- `deskbird_get_floor_config` - Floor plan layout with desk coordinates
- `deskbird_api_call` - Direct API access (preview tool)
- And more...

**🗺️ Spatial Awareness Features**:
The server now includes "office social radar" capabilities enabling intelligent queries about desk proximity and colleague locations:

- **"Who's sitting near me today?"** - Find colleagues in nearby desks
- **"Find available desks near my team"** - Proximity-based desk booking  
- **"When will nearby desks be free?"** - Time-based availability with spatial context
- **"Show me the seating map for this afternoon"** - Visual occupancy planning

These features combine real-time occupancy data with precise floor plan coordinates to enable smart office navigation and collaboration planning.

### Authentication Flow

1. Uses refresh token from environment to get fresh access token via Google API
2. Uses access token to authenticate with Deskbird API
3. Required environment variables: `REFRESH_TOKEN`, `GOOGLE_API_KEY`

### Configuration

**Required environment variables** in `.env`:
- `REFRESH_TOKEN` - Deskbird refresh token
- `GOOGLE_API_KEY` - Google API key for token refresh  
- `DESKBIRD_RESOURCE_ID` - Default desk/resource ID
- `DESKBIRD_ZONE_ITEM_ID` - Default zone item ID
- `DESKBIRD_WORKSPACE_ID` - Default workspace ID

**Optional environment variables**:
- `LOG_LEVEL` - Logging verbosity (`silent`, `error`, `warn`, `info`, `debug`)
- `DEBUG` - Enable debug logging (`true`/`1`)
- `NODE_ENV` - Environment mode (`development`, `production`)
- `ENABLE_PREVIEW_TOOLS` - Enable preview tools like `deskbird_api_call` (`true`/`1`)

### API Integration

- **Google Token API**: `https://securetoken.googleapis.com/v1/token` - Token refresh
- **Deskbird API**: `https://api.deskbird.com/v1.1/bookings` - Desk booking

### Date Handling

- Uses Luxon library with Europe/Amsterdam timezone
- Default booking hours: 9:00 AM to 6:00 PM
- Automatically skips weekend bookings (Saturday/Sunday)

## Logging Architecture

### 🚨 Critical MCP Logging Rules

**NEVER use `console.log()` in MCP servers** - it breaks JSON-RPC protocol and causes "Unexpected token" errors in Claude Desktop.

```typescript
// ❌ WRONG - Breaks Claude Desktop integration
console.log('Processing request');

// ✅ CORRECT - Use custom logger
const logger = createLogger('ComponentName');
logger.debug('Processing request');
```

### Quick Reference

```typescript
import { createLogger } from './utils/logger.js';

const logger = createLogger('MyComponent');

logger.debug('Detailed debugging info');        // Development only
logger.info('Server started successfully');     // Important events
logger.warn('Using fallback configuration');    // Warnings
logger.error('Authentication failed', error);   // Errors with context
```

### Environment Variables

**Logging Configuration**:
- `LOG_LEVEL` - Set to `silent`, `error`, `warn`, `info`, or `debug`
- `DEBUG` - Set to `true` or `1` to enable debug logging
- `NODE_ENV` - `production` defaults to error level, others default to info

**Development Examples**:
```bash
# Verbose development logging
LOG_LEVEL=debug npm run dev

# Quiet production-like logging  
LOG_LEVEL=error npm run dev

# Test clean JSON-RPC output
LOG_LEVEL=silent npm start 2>/dev/null
```

### Debugging Commands

```bash
# Test server with different log levels
LOG_LEVEL=info node dist/main.js
LOG_LEVEL=debug node dist/main.js
LOG_LEVEL=error node dist/main.js

# Verify JSON-RPC protocol compliance (no stderr output)
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | \
  LOG_LEVEL=silent node dist/main.js 2>/dev/null | jq '.'
```

**📖 For detailed logging best practices, see: [docs/logging-best-practices.md](docs/logging-best-practices.md)**