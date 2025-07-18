import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  TextContent,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { DateTime } from 'luxon';
import * as dotenvFlow from 'dotenv-flow';

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
  outputSchema: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Whether the booking was successfully created.',
      },
      message: {
        type: 'string',
        description: 'A human-readable summary of the result.',
      },
      details: {
        type: 'object',
        description: 'The detailed response from the Deskbird API.',
        properties: {
          successfulBookings: { type: 'array', items: { type: 'object' } },
          failedBookings: { type: 'array', items: { type: 'object' } },
        },
      },
    },
    required: ['success', 'message', 'details'],
  },
};

// --- Main Server Class ---
export class DeskbirdMcpServer {
  private readonly mcpServer: Server;
  private readonly tools: Tool[] = [BOOK_DESK_TOOL];

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
  ): Promise<{ content: TextContent[]; isError?: boolean }> {
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
      const params = request.params.arguments as {
        date: string;
        resource_id?: string;
        workspace_id?: string;
        zone_item_id?: number;
      };

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
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
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
        content: [{ type: 'text', text: JSON.stringify(finalResult, null, 2) }],
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
    data: any,
    accessToken: string
  ): Promise<any> {
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
