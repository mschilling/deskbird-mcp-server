import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  TextContent,
  Tool,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { DateTime } from 'luxon';
import * as dotenvFlow from 'dotenv-flow';
import {
  BookDeskParams,
  GetUserBookingsParams,
  CreateBookingRequest,
  CreateBookingResponse,
  BookingsListResponse,
  ToolResult,
  GetUserBookingsResult,
} from './types.js';

// Load environment variables from .env files
dotenvFlow.config();

// --- Constants ---
const DESKBIRD_API_BASE_URL = 'https://api.deskbird.com/v1.1';
const GOOGLE_TOKEN_API_URL = 'https://securetoken.googleapis.com/v1/token';

// --- Tool Definition for booking a desk ---
const BOOK_DESK_TOOL: Tool = {
  name: 'deskbird_book_desk',
  description: 'Books a desk at the office for a specific date.',
  inputSchema: {
    type: 'object',
    properties: {
      date: {
        type: 'string',
        format: 'date',
        description: 'The date to book the desk in YYYY-MM-DD format.',
      },
      resource_id: {
        type: 'string',
        description:
          'Optional: The ID of the specific desk/resource. Defaults to the server environment setting.',
      },
      workspace_id: {
        type: 'string',
        description:
          'Optional: The ID of the workspace. Defaults to the server environment setting.',
      },
      zone_item_id: {
        type: 'number',
        description:
          'Optional: The ID of the zone item. Defaults to the server environment setting.',
      },
    },
    required: ['date'],
  },
};

// --- Tool Definition for retrieving user bookings ---
const GET_USER_BOOKINGS_TOOL: Tool = {
  name: 'deskbird_get_user_bookings',
  description: 'Retrieves a list of the current user\'s desk bookings with optional filtering.',
  inputSchema: {
    type: 'object',
    properties: {
      skip: {
        type: 'number',
        description: 'Number of bookings to skip for pagination. Defaults to 0.',
        default: 0,
      },
      limit: {
        type: 'number',
        description: 'Maximum number of bookings to return. Defaults to 10.',
        default: 10,
      },
      include_instances: {
        type: 'boolean',
        description: 'Whether to include booking instances. Defaults to true.',
        default: true,
      },
      upcoming: {
        type: 'boolean',
        description: 'Filter to show only upcoming bookings. Defaults to true.',
        default: true,
      },
    },
  },
};

// --- Main Server Class ---
export class DeskbirdMcpServer {
  private readonly mcpServer: Server;
  private readonly tools: Tool[] = [BOOK_DESK_TOOL, GET_USER_BOOKINGS_TOOL];

  constructor() {
    this.mcpServer = new Server(
      {
        name: 'deskbird-mcp-server-standalone',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {}, // Tools are listed via the ListToolsRequest handler
        },
      }
    );

    this.registerRequestHandlers();
  }

  private registerRequestHandlers(): void {
    // Handler for ListToolsRequest
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
      console.error('Received ListToolsRequest');
      return {
        tools: this.tools,
      };
    });

    // Handler for CallToolRequest
    this.mcpServer.setRequestHandler(
      CallToolRequestSchema,
      async (request, extra) => {
        console.error(
          `Received CallToolRequest for tool: ${request.params.name}`
        );
        if (request.params.name === BOOK_DESK_TOOL.name) {
          return this.handleBookDesk(request, extra);
        } else if (request.params.name === GET_USER_BOOKINGS_TOOL.name) {
          return this.handleGetUserBookings(request, extra);
        } else {
          console.error(`Unknown tool requested: ${request.params.name}`);
          return {
            content: [
              {
                type: 'text',
                text: `Error: Unknown tool '${request.params.name}'`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  // --- Tool Handler Logic ---

  private async handleBookDesk(
    request: CallToolRequest,
    extra: RequestHandlerExtra<CallToolRequest, any>
  ): Promise<CallToolResult> {
    console.log("Executing tool 'deskbird_book_desk'");

    try {
      // 1. Validate environment variables
      const refreshToken = process.env.REFRESH_TOKEN;
      const googleApiKey = process.env.GOOGLE_API_KEY;

      if (!refreshToken || !googleApiKey) {
        throw new Error(
          'Server-side configuration error: REFRESH_TOKEN or GOOGLE_API_KEY is not set.'
        );
      }

      // 2. Extract and validate parameters
      const params = request.params.arguments as unknown as BookDeskParams;

      if (!params.date) {
        throw new Error("Missing required parameter: 'date'");
      }

      // 3. Merge tool inputs with environment fallbacks
      const resourceId = params.resource_id || process.env.DESKBIRD_RESOURCE_ID;
      const workspaceId =
        params.workspace_id || process.env.DESKBIRD_WORKSPACE_ID;
      const zoneItemIdStr =
        params.zone_item_id?.toString() || process.env.DESKBIRD_ZONE_ITEM_ID;

      if (!resourceId || !workspaceId || !zoneItemIdStr) {
        throw new Error(
          'Desk booking details (resourceId, workspaceId, zoneItemId) must be provided either in the tool call or as environment variables.'
        );
      }
      const zoneItemId = parseInt(zoneItemIdStr, 10);

      // 4. Get a fresh access token
      const accessToken = await this._getNewAccessToken(
        refreshToken,
        googleApiKey
      );

      // 5. Handle date logic
      const bookingDate = DateTime.fromISO(params.date, {
        zone: 'Europe/Amsterdam',
      });
      if (!bookingDate.isValid) {
        throw new Error(
          `Invalid date format: '${params.date}'. Please use YYYY-MM-DD.`
        );
      }

      if (bookingDate.weekday === 6 || bookingDate.weekday === 7) {
        const result = {
          success: true,
          message: 'Booking date falls on a weekend. No action taken.',
          details: { successfulBookings: [], failedBookings: [] },
        };
        return {
          content: [{
            type: 'text',
            text: 'Booking date falls on a weekend. No action taken.'
          }],
        };
      }

      const startDateTime = bookingDate.set({ hour: 9 });
      const endDateTime = bookingDate.set({ hour: 18 });

      // 6. Construct the booking payload
      const bookingPayload = {
        bookings: [
          {
            bookingStartTime: startDateTime.toMillis(),
            bookingEndTime: endDateTime.toMillis(),
            isAnonymous: false,
            resourceId: resourceId,
            zoneItemId: zoneItemId,
            workspaceId: workspaceId,
          },
        ],
      };

      // 7. Execute the booking
      const responseData = await this._createBookingApiCall(
        bookingPayload,
        accessToken
      );

      // 8. Format and return the response
      const successfulCount = responseData.successfulBookings?.length || 0;
      const failedCount = responseData.failedBookings?.length || 0;
      const message = `Booking process complete. Successful: ${successfulCount}, Failed: ${failedCount}.`;

      const finalResult = {
        success: failedCount === 0,
        message: message,
        details: responseData,
      };

      return {
        content: [{
          type: 'text',
          text: `Desk booking completed successfully! ${message}\n\nDetails:\n${JSON.stringify(finalResult, null, 2)}`
        }],
      };
    } catch (error) {
      console.error('Error in handleBookDesk:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }

  private async handleGetUserBookings(
    request: CallToolRequest,
    extra: RequestHandlerExtra<CallToolRequest, any>
  ): Promise<CallToolResult> {
    console.log("Executing tool 'deskbird_get_user_bookings'");

    try {
      // 1. Validate environment variables
      const refreshToken = process.env.REFRESH_TOKEN;
      const googleApiKey = process.env.GOOGLE_API_KEY;

      if (!refreshToken || !googleApiKey) {
        throw new Error(
          'Server-side configuration error: REFRESH_TOKEN or GOOGLE_API_KEY is not set.'
        );
      }

      // 2. Extract and validate parameters
      const params = request.params.arguments as unknown as GetUserBookingsParams;

      // 3. Set defaults for optional parameters
      const skip = params.skip ?? 0;
      const limit = params.limit ?? 10;
      const includeInstances = params.include_instances ?? true;
      const upcoming = params.upcoming ?? true;

      // 4. Get a fresh access token
      const accessToken = await this._getNewAccessToken(
        refreshToken,
        googleApiKey
      );

      // 5. Execute the API call
      const responseData = await this._getUserBookingsApiCall(
        { skip, limit, includeInstances, upcoming },
        accessToken
      );

      // 6. Format and return the response
      const result = {
        success: responseData.success || true,
        message: `Retrieved ${responseData.currentCount || 0} bookings (${responseData.totalCount || 0} total available).`,
        pagination: {
          totalCount: responseData.totalCount,
          currentCount: responseData.currentCount,
          maximumCountPerPage: responseData.maximumCountPerPage,
          next: responseData.next,
          previous: responseData.previous,
        },
        bookings: responseData.results || [],
      };

      return {
        content: [{
          type: 'text',
          text: `Retrieved ${responseData.currentCount || 0} bookings (${responseData.totalCount || 0} total available).\n\nBookings Summary:\n${JSON.stringify(result, null, 2)}`
        }],
      };
    } catch (error) {
      console.error('Error in handleGetUserBookings:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }

  // --- Private Helper Methods (from original project) ---

  private async _getNewAccessToken(
    refreshToken: string,
    apiKey: string
  ): Promise<string> {
    const response = await fetch(`${GOOGLE_TOKEN_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      console.log('Access token successfully created');
      return data.access_token;
    } else {
      console.error('Failed to get a new access token. Response:', data);
      throw new Error('Could not refresh the access token.');
    }
  }

  private async _createBookingApiCall(
    data: CreateBookingRequest,
    accessToken: string
  ): Promise<CreateBookingResponse> {
    const response = await fetch(`${DESKBIRD_API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Deskbird API Error:', errorBody);
      throw new Error(`Deskbird API error! status: ${response.status}`);
    }

    return await response.json();
  }

  private async _getUserBookingsApiCall(
    queryParams: {
      skip: number;
      limit: number;
      includeInstances: boolean;
      upcoming: boolean;
    },
    accessToken: string
  ): Promise<BookingsListResponse> {
    const params = new URLSearchParams({
      skip: queryParams.skip.toString(),
      limit: queryParams.limit.toString(),
      includeInstances: queryParams.includeInstances.toString(),
      upcoming: queryParams.upcoming.toString(),
    });

    const response = await fetch(
      `${DESKBIRD_API_BASE_URL}/user/bookings?${params}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Deskbird API Error:', errorBody);
      throw new Error(`Deskbird API error! status: ${response.status}`);
    }

    return await response.json();
  }

  // --- Public Connection Methods ---

  public async connect(transport: Transport): Promise<void> {
    await this.mcpServer.connect(transport);
    console.error('Deskbird MCP Server connected and running.');
  }

  public async close(): Promise<void> {
    await this.mcpServer.close();
    console.error('Deskbird MCP Server closed.');
  }
}
