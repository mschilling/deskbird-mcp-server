// Refactored Deskbird MCP Server using the new SDK
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema, 
  type CallToolRequest,
  type CallToolResult,
  type Tool
} from '@modelcontextprotocol/sdk/types.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { createDeskbirdClient, type DeskbirdSdk } from './sdk/index.js';
import { DateUtils } from './sdk/utils/date-utils.js';
import type { Environment } from './sdk/config/environments.js';
import * as dotenvFlow from 'dotenv-flow';

// Load environment variables
dotenvFlow.config();

// --- Tool Definitions ---
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
      desk_id: {
        type: 'number',
        description: 'The ID of the specific desk (zone item ID) to book.',
      },
    },
    required: ['date', 'desk_id'],
  },
};

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

const FAVORITE_DESK_TOOL: Tool = {
  name: "deskbird_favorite_desk",
  description: 'Adds a desk to the users favorite desks list.',
  inputSchema: {
    type: 'object',
    properties: {
      desk_id: {
        type: 'number',
        description: 'The desk number (e.g., 57 for Desk 57) - NOT the internal resource/zone ID. Use the desk number that appears in the desk title.',
      },
    },
    required: ['desk_id'],
  },
};

const UNFAVORITE_DESK_TOOL: Tool = {
  name: 'deskbird_unfavorite_desk',
  description: 'Removes a desk from the users favorite desks list.',
  inputSchema: {
    type: 'object',
    properties: {
      desk_id: {
        type: 'number',
        description: 'The desk number (e.g., 57 for Desk 57) - NOT the internal resource/zone ID. Use the desk number that appears in the desk title.',
      },
    },
    required: ['desk_id'],
  },
};

const GET_USER_FAVORITES_TOOL: Tool = {
  name: 'deskbird_get_user_favorites',
  description: 'Retrieves the user\'s current favorite desks list with desk details including names, locations, and IDs.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

const GET_USER_INFO_TOOL: Tool = {
  name: "deskbird_get_user_info",
  description: 'Retrieves the current user\'s profile information including name, office, settings, and account details.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

const GET_AVAILABLE_DESKS_TOOL: Tool = {
  name: "deskbird_get_available_desks",
  description: 'Retrieves a list of all available desks from the floor configuration. Shows both desk numbers (used for favoriting) and internal resource IDs. Use the desk number (e.g., 57) for favoriting, not the internal ID.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

const DESKBIRD_API_CALL_TOOL: Tool = {
  name: 'deskbird_api_call',
  description: '⚠️ PREVIEW TOOL: Execute any HTTP request to the Deskbird API with full control over path, method, headers, and body. This tool provides direct access to the Deskbird API for advanced users and debugging. Use with caution and ensure you understand the API structure. Examples: GET /user, POST /bookings, PATCH /user/favoriteResource.',
  inputSchema: {
    type: 'object',
    properties: {
      method: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        description: 'HTTP method for the API call',
      },
      path: {
        type: 'string',
        description: 'API endpoint path (without base URL). Examples: "/user", "/bookings", "/user/favoriteResource", "/company/internalWorkspaces"',
      },
      api_version: {
        type: 'string',
        description: 'API version to use (optional). Defaults to "v1.1". Examples: "v1.1", "v3". Some endpoints require specific versions.',
        default: 'v1.1'
      },
      body: {
        type: 'object',
        description: 'Request body for POST/PUT/PATCH requests (optional for GET/DELETE). Must be a valid JSON object.',
      },
      query_params: {
        type: 'object',
        additionalProperties: {
          type: ['string', 'number', 'boolean']
        },
        description: 'URL query parameters as key-value pairs (optional). Example: {"skip": 0, "limit": 10}',
      },
      headers: {
        type: 'object',
        additionalProperties: {
          type: 'string'
        },
        description: 'Additional HTTP headers (optional). Authorization header is automatically added. Example: {"Content-Type": "application/json"}',
      }
    },
    required: ['method', 'path']
  }
};

/**
 * Refactored Deskbird MCP Server using the new SDK
 */
export class DeskbirdMcpServer {
  private readonly mcpServer: Server;
  private deskbirdSdk: DeskbirdSdk | null = null;
  private readonly tools: Tool[] = [
    BOOK_DESK_TOOL,
    GET_USER_BOOKINGS_TOOL,
    FAVORITE_DESK_TOOL,
    UNFAVORITE_DESK_TOOL,
    GET_USER_FAVORITES_TOOL,
    GET_USER_INFO_TOOL,
    GET_AVAILABLE_DESKS_TOOL,
    DESKBIRD_API_CALL_TOOL,
  ];

  constructor() {
    this.mcpServer = new Server(
      {
        name: 'deskbird-mcp-server-sdk',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.registerRequestHandlers();
  }

  /**
   * Initialize the SDK with environment configuration
   */
  private async initializeSdk(): Promise<DeskbirdSdk> {
    if (this.deskbirdSdk) {
      return this.deskbirdSdk;
    }

    // Validate environment variables
    const refreshToken = process.env.REFRESH_TOKEN;
    const googleApiKey = process.env.GOOGLE_API_KEY;

    if (!refreshToken || !googleApiKey) {
      throw new Error(
        'Missing required environment variables: REFRESH_TOKEN and GOOGLE_API_KEY'
      );
    }

    // Create SDK client
    this.deskbirdSdk = createDeskbirdClient({
      environment: (process.env.NODE_ENV === 'production' ? 'production' : 'development') as Environment,
      refreshToken,
      googleApiKey,
      defaultWorkspaceId: process.env.DESKBIRD_WORKSPACE_ID,
      defaultResourceId: process.env.DESKBIRD_RESOURCE_ID,
      defaultGroupId: process.env.DESKBIRD_GROUP_ID,
      enableRequestLogging: process.env.NODE_ENV === 'development',
    });

    // Initialize the SDK
    await this.deskbirdSdk.initialize();

    return this.deskbirdSdk;
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
      async (request) => {
        console.error(`Received CallToolRequest for tool: ${request.params.name}`);
        
        if (request.params.name === BOOK_DESK_TOOL.name) {
          return this.handleBookDeskWithSdk(request);
        } else if (request.params.name === GET_USER_BOOKINGS_TOOL.name) {
          return this.handleGetUserBookingsWithSdk(request);
        } else if (request.params.name === FAVORITE_DESK_TOOL.name) {
          return this.handleFavoriteDeskWithSdk(request);
        } else if (request.params.name === UNFAVORITE_DESK_TOOL.name) {
          return this.handleUnfavoriteDeskWithSdk(request);
        } else if (request.params.name === GET_USER_FAVORITES_TOOL.name) {
          return this.handleGetUserFavoritesWithSdk(request);
        } else if (request.params.name === GET_USER_INFO_TOOL.name) {
          return this.handleGetUserInfoWithSdk(request);
        } else if (request.params.name === GET_AVAILABLE_DESKS_TOOL.name) {
          return this.handleGetAvailableDesksWithSdk(request);
        } else if (request.params.name === DESKBIRD_API_CALL_TOOL.name) {
          return this.handleDeskbirdApiCallWithSdk(request);
        } else {
          throw new Error(`Unknown tool: ${request.params.name}`);
        }
      }
    );
  }

  /**
   * Refactored handleBookDesk using the SDK
   */
  private async handleBookDeskWithSdk(request: any): Promise<any> {
    console.log("Executing tool 'deskbird_book_desk' with SDK");

    try {
      const sdk = await this.initializeSdk();
      const params = request.params.arguments;

      // Validate date
      const dateValidation = DateUtils.validateBookingDate(params.date);
      if (!dateValidation.isValid) {
        return {
          content: [{
            type: 'text',
            text: `Booking validation failed: ${dateValidation.errors.join(', ')}`
          }],
          isError: true,
        };
      }

      // Use SDK's high-level booking method
      const result = await sdk.bookDesk({
        deskNumber: params.desk_id,
        date: params.date,
      });

      const successfulCount = result.successfulBookings?.length || 0;
      const failedCount = result.failedBookings?.length || 0;
      const message = `Booking process complete. Successful: ${successfulCount}, Failed: ${failedCount}.`;

      return {
        content: [{
          type: 'text',
          text: `Desk booking completed successfully! ${message}\\n\\nDetails:\\n${JSON.stringify(result, null, 2)}`
        }],
      };
    } catch (error) {
      console.error('Error in handleBookDeskWithSdk:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }

  /**
   * Refactored handleGetUserBookings using the SDK
   */
  private async handleGetUserBookingsWithSdk(request: any): Promise<any> {
    console.log("Executing tool 'deskbird_get_user_bookings' with SDK");

    try {
      const sdk = await this.initializeSdk();
      const params = request.params.arguments || {};

      // Use SDK's bookings API
      const responseData = await sdk.bookings.getUserBookings({
        skip: params.skip ?? 0,
        limit: params.limit ?? 10,
        include_instances: params.include_instances ?? true,
        upcoming: params.upcoming ?? true,
      });

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
          text: `Retrieved ${responseData.currentCount || 0} bookings (${responseData.totalCount || 0} total available).\\n\\nBookings Summary:\\n${JSON.stringify(result, null, 2)}`
        }],
      };
    } catch (error) {
      console.error('Error in handleGetUserBookingsWithSdk:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }

  /**
   * Refactored handleFavoriteDesk using the SDK
   */
  private async handleFavoriteDeskWithSdk(request: any): Promise<any> {
    console.log("Executing tool 'deskbird_favorite_desk' with SDK");

    try {
      const sdk = await this.initializeSdk();
      const params = request.params.arguments;

      if (!params.desk_id) {
        throw new Error("Missing required parameter: 'desk_id'");
      }

      // Use SDK's high-level favorite method
      const responseData = await sdk.favoriteDeskByNumber(params.desk_id);

      const deskName = responseData.data?.name || `Desk ${params.desk_id}`;
      const result = {
        success: responseData.success,
        message: `Desk "${deskName}" (Desk ID: ${params.desk_id}) has been added to your favorites.`,
        details: responseData.data || responseData,
      };

      return {
        content: [{
          type: 'text',
          text: `Desk favorited successfully! ${result.message}\\n\\nDetails:\\n${JSON.stringify(result, null, 2)}`
        }],
      };
    } catch (error) {
      console.error('Error in handleFavoriteDeskWithSdk:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }

  /**
   * Refactored handleUnfavoriteDesk using the SDK
   */
  private async handleUnfavoriteDeskWithSdk(request: CallToolRequest): Promise<CallToolResult> {
    console.log("Executing tool 'deskbird_unfavorite_desk' with SDK");

    try {
      const sdk = await this.initializeSdk();
      const params = request.params.arguments as any;

      if (!params.desk_id) {
        throw new Error("Missing required parameter: 'desk_id'");
      }

      // Use SDK's high-level unfavorite method
      const responseData = await sdk.unfavoriteDeskByNumber(params.desk_id);

      const result = {
        success: responseData.success,
        message: `Desk ${params.desk_id} has been removed from your favorites.`,
        details: responseData,
      };

      return {
        content: [{
          type: 'text',
          text: `Desk unfavorited successfully! ${result.message}\n\nDetails:\n${JSON.stringify(result, null, 2)}`
        }],
      };
    } catch (error) {
      console.error('Error in handleUnfavoriteDeskWithSdk:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }

  /**
   * Refactored handleGetUserFavorites using the SDK
   */
  private async handleGetUserFavoritesWithSdk(request: CallToolRequest): Promise<CallToolResult> {
    console.log("Executing tool 'deskbird_get_user_favorites' with SDK");

    try {
      const sdk = await this.initializeSdk();

      // Get user favorites using SDK
      const userData = await sdk.user.getCurrentUser();
      const favoriteResources = userData.favoriteResources || [];

      // Get available desks to enhance favorites with desk numbers
      const allDesks = await sdk.getAvailableDesks();
      const deskMapping: Record<number, number> = {};
      
      // Create mapping from zone ID to desk number
      allDesks.forEach(desk => {
        if (desk.zoneId && desk.deskNumber !== null) {
          deskMapping[parseInt(desk.zoneId)] = desk.deskNumber;
        }
      });

      // Enhance favorite resources with desk numbers
      const enhancedFavorites = favoriteResources.map(fav => ({
        ...fav,
        deskNumber: deskMapping[fav.id] || null,
      }));

      const result = {
        success: true,
        message: `Retrieved ${favoriteResources.length} favorite desks.`,
        user: {
          id: userData.id,
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
        },
        favoriteCount: favoriteResources.length,
        favorites: enhancedFavorites,
      };

      return {
        content: [{
          type: 'text',
          text: `Retrieved ${favoriteResources.length} favorite desks.\n\nUser: ${userData.firstName} ${userData.lastName} (${userData.email})\n\nFavorite Desks:\n${JSON.stringify(enhancedFavorites, null, 2)}`
        }],
      };
    } catch (error) {
      console.error('Error in handleGetUserFavoritesWithSdk:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }

  /**
   * Refactored handleGetUserInfo using the SDK
   */
  private async handleGetUserInfoWithSdk(request: CallToolRequest): Promise<CallToolResult> {
    console.log("Executing tool 'deskbird_get_user_info' with SDK");

    try {
      const sdk = await this.initializeSdk();

      // Get user data using SDK
      const userData = await sdk.user.getCurrentUser();

      // Extract meaningful user information
      const userInfo = {
        profile: {
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          id: userData.id,
        },
        office: {
          primaryOfficeId: userData.primaryOfficeId,
          accessibleOffices: userData.accessibleOfficeIds?.length || 0,
          role: userData.role,
        },
        preferences: {
          language: userData.language,
          hourFormat: userData.hourFormat,
          timeZone: userData.favoriteResources?.[0]?.timeZone || 'Unknown',
          calendarInvites: userData.userSettings?.enableCalendarInvites || false,
        },
        activity: {
          favoriteDesksCount: userData.favoriteResources?.length || 0,
          accountCreated: new Date(userData.createdAt).toLocaleDateString(),
          lastUpdated: new Date(userData.updatedAt).toLocaleDateString(),
        },
        account: {
          status: userData.status,
          isDemoUser: userData.demoUser,
          profileType: userData.profileType,
          allowNameChange: userData.allowNameChange,
        },
        workSetup: {
          userGroupIds: userData.userGroupIds?.length || 0,
          hybridWorkPolicy: userData.hybridWorkPolicyId ? 'Enabled' : 'Not set',
          dedicatedResources: userData.dedicatedResources?.length || 0,
          externalProvider: userData.externalUserData?.provider || 'Unknown',
        }
      };

      const result = {
        success: true,
        message: `Retrieved user information for ${userData.firstName} ${userData.lastName}`,
        user: userInfo,
      };

      return {
        content: [{
          type: 'text',
          text: `User Information Retrieved Successfully!\n\n👤 Profile: ${userInfo.profile.name} (${userInfo.profile.email})\n🏢 Office: Primary Office ID ${userInfo.office.primaryOfficeId} | Role: ${userInfo.office.role}\n⭐ Favorites: ${userInfo.activity.favoriteDesksCount} desk(s)\n🌍 Preferences: ${userInfo.preferences.language} | ${userInfo.preferences.hourFormat} | Calendar invites: ${userInfo.preferences.calendarInvites ? 'Yes' : 'No'}\n📅 Account: Created ${userInfo.activity.accountCreated} | Status: ${userInfo.account.status}\n👥 Work Setup: ${userInfo.workSetup.userGroupIds} groups | Provider: ${userInfo.workSetup.externalProvider}\n\nDetailed Info:\n${JSON.stringify(result, null, 2)}`
        }],
      };
    } catch (error) {
      console.error('Error in handleGetUserInfoWithSdk:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }

  /**
   * Refactored handleGetAvailableDesks using the SDK
   */
  private async handleGetAvailableDesksWithSdk(request: CallToolRequest): Promise<CallToolResult> {
    console.log("Executing tool 'deskbird_get_available_desks' with SDK");

    try {
      const sdk = await this.initializeSdk();

      // Use SDK's high-level method
      const allDesks = await sdk.getAvailableDesks();

      const resultText = allDesks.length > 0
        ? `Found ${allDesks.length} available desks:\n\n${allDesks.map(desk => {
            const favoriteId = desk.deskNumber !== null ? `Desk #${desk.deskNumber}` : `Internal ID: ${desk.id}`;
            return `• **${desk.title}** (${favoriteId}) - Zone ID: ${desk.zoneId} - Area: ${desk.areaName} - Status: ${desk.status}${desk.deskNumber !== null ? '\n  ↳ *Use desk number ' + desk.deskNumber + ' for favoriting*' : ''}`;
          }).join('\n\n')}`
        : 'No desks found in the floor configuration.';

      return {
        content: [{
          type: 'text',
          text: resultText
        }],
        isError: false,
      };
    } catch (error) {
      console.error('Error in handleGetAvailableDesksWithSdk:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }

  /**
   * Refactored handleDeskbirdApiCall using the SDK
   */
  private async handleDeskbirdApiCallWithSdk(request: CallToolRequest): Promise<CallToolResult> {
    console.log("Executing tool 'deskbird_api_call' with SDK");

    try {
      const sdk = await this.initializeSdk();
      const params = request.params.arguments as any;

      if (!params.method || !params.path) {
        throw new Error("Missing required parameters: 'method' and 'path'");
      }

      // Validate path format
      if (params.path.startsWith('http://') || params.path.startsWith('https://')) {
        throw new Error("Path must be relative (e.g., '/user'), not an absolute URL");
      }

      // Use SDK's generic API call method
      const responseData = await sdk.apiCall(
        params.method,
        params.path,
        params.body,
        params.query_params,
        params.headers
      );

      const statusEmoji = '✅';
      const formattedResponse = `${statusEmoji} **API Call Completed**\n\n**Request:** ${params.method} ${params.path}\n**Status:** Success\n\n**Response Data:**\n${JSON.stringify(responseData, null, 2)}`;

      return {
        content: [{
          type: 'text',
          text: formattedResponse
        }],
        isError: false,
      };
    } catch (error) {
      console.error('Error in handleDeskbirdApiCallWithSdk:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        content: [{ type: 'text', text: `❌ **API Call Failed**\n\nError: ${errorMessage}` }],
        isError: true,
      };
    }
  }

  // --- Public Connection Methods ---

  public async connect(transport: Transport): Promise<void> {
    await this.mcpServer.connect(transport);
    console.error('Deskbird MCP Server (SDK-based) connected and running.');
  }

  public async close(): Promise<void> {
    await this.mcpServer.close();
    console.error('Deskbird MCP Server (SDK-based) closed.');
  }
}
