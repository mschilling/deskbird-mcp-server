import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import {
  CallToolRequest,
  CallToolRequestSchema,
  CallToolResult,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import * as dotenvFlow from 'dotenv-flow';
import { DateTime } from 'luxon';
import {
  BookDeskParams,
  BookingsListResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  FavoriteDeskParams,
  FavoriteResourceResponse,
  GetUserBookingsParams,
  UnfavoriteDeskParams,
  UnfavoriteResourceResponse,
  UserResponse
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
      desk_id: {
        type: 'number',
        description: 'The ID of the specific desk (zone item ID) to book.',
      },
    },
    required: ['date', 'desk_id'],
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

// --- Tool Definition for adding a desk to favorites ---
const FAVORITE_DESK_TOOL = {
  name: "deskbird_favorite_desk",
  description: 'Adds a desk to the users favorite desks list.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      desk_id: {
        type: 'number',
        description: 'The desk number (e.g., 57 for Desk 57) - NOT the internal resource/zone ID. Use the desk number that appears in the desk title.',
      },
    },
    required: ['desk_id'],
  },
};

// --- Tool Definition for removing a desk from favorites ---
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

// --- Tool Definition for getting user's favorite desks ---
const GET_USER_FAVORITES_TOOL: Tool = {
  name: 'deskbird_get_user_favorites',
  description: 'Retrieves the user\'s current favorite desks list with desk details including names, locations, and IDs.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

// --- Tool Definition for getting current user data ---
const GET_USER_INFO_TOOL = {
  name: "deskbird_get_user_info",
  description: 'Retrieves the current user\'s profile information including name, office, settings, and account details.',
  inputSchema: {
    type: 'object' as const,
    properties: {},
  },
};

// --- Tool Definition for getting available desks ---
const GET_AVAILABLE_DESKS_TOOL = {
  name: "deskbird_get_available_desks",
  description: 'Retrieves a list of all available desks from the floor configuration. Shows both desk numbers (used for favoriting) and internal resource IDs. Use the desk number (e.g., 57) for favoriting, not the internal ID.',
  inputSchema: {
    type: 'object' as const,
    properties: {},
  },
};

// --- Main Server Class ---
export class DeskbirdMcpServer {
  private readonly mcpServer: Server;
  private readonly tools: Tool[] = [BOOK_DESK_TOOL, GET_USER_BOOKINGS_TOOL, FAVORITE_DESK_TOOL, UNFAVORITE_DESK_TOOL, GET_USER_FAVORITES_TOOL, GET_USER_INFO_TOOL, GET_AVAILABLE_DESKS_TOOL];

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
        } else if (request.params.name === FAVORITE_DESK_TOOL.name) {
          return this.handleFavoriteDesk(request, extra);
        } else if (request.params.name === UNFAVORITE_DESK_TOOL.name) {
          return this.handleUnfavoriteDesk(request, extra);
        } else if (request.params.name === GET_USER_FAVORITES_TOOL.name) {
          return this.handleGetUserFavorites(request, extra);
        } else if (request.params.name === GET_USER_INFO_TOOL.name) {
          return this.handleGetUserInfo(request, extra);
        } else if (request.params.name === GET_AVAILABLE_DESKS_TOOL.name) {
          return this.handleGetAvailableDesks(request, extra);
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

      if (!params.desk_id) {
        throw new Error("Missing required parameter: 'desk_id'");
      }

      // 3. Get required values from environment variables
      const resourceId = process.env.DESKBIRD_RESOURCE_ID;
      const workspaceId = process.env.DESKBIRD_WORKSPACE_ID;
      const zoneItemId = params.desk_id;

      if (!resourceId || !workspaceId) {
        throw new Error(
          'Environment variables DESKBIRD_RESOURCE_ID and DESKBIRD_WORKSPACE_ID must be set.'
        );
      }      // 4. Get a fresh access token
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

  private async handleFavoriteDesk(
    request: CallToolRequest,
    extra: RequestHandlerExtra<CallToolRequest, any>
  ): Promise<CallToolResult> {
    console.log("Executing tool 'deskbird_favorite_desk'");

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
      const params = request.params.arguments as unknown as FavoriteDeskParams;

      if (!params.desk_id) {
        throw new Error("Missing required parameter: 'desk_id'");
      }

      // 3. Get a fresh access token
      const accessToken = await this._getNewAccessToken(
        refreshToken,
        googleApiKey
      );

      // 4. Lookup the zone ID for this desk
      const zoneId = await this._lookupDeskZoneId(params.desk_id, accessToken);

      if (!zoneId) {
        throw new Error(`Desk with ID ${params.desk_id} not found. Please check the desk ID.`);
      }

      // 5. Execute the favorite API call with the correct zone ID
      const responseData = await this._favoriteDeskApiCall(
        zoneId,
        accessToken
      );

      // 5. Handle different response formats
      if (!responseData.success) {
        // Handle error responses (e.g., resource already favorited, not found, etc.)
        const errorMessage = responseData.message || 'Failed to favorite desk';
        return {
          content: [{
            type: 'text',
            text: `Error favoriting desk: ${errorMessage}`
          }],
          isError: true,
        };
      }

      // 6. Format and return the success response
      const deskName = responseData.data?.name || `Desk ${params.desk_id}`;
      const result = {
        success: responseData.success,
        message: `Desk "${deskName}" (Desk ID: ${params.desk_id}, Zone ID: ${zoneId}) has been added to your favorites.`,
        details: responseData.data || responseData,
      };

      return {
        content: [{
          type: 'text',
          text: `Desk favorited successfully! ${result.message}\n\nDetails:\n${JSON.stringify(result, null, 2)}`
        }],
      };
    } catch (error) {
      console.error('Error in handleFavoriteDesk:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }

  private async handleUnfavoriteDesk(
    request: CallToolRequest,
    extra: RequestHandlerExtra<CallToolRequest, any>
  ): Promise<CallToolResult> {
    console.log("Executing tool 'deskbird_unfavorite_desk'");

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
      const params = request.params.arguments as unknown as UnfavoriteDeskParams;

      if (!params.desk_id) {
        throw new Error("Missing required parameter: 'desk_id'");
      }

      // 3. Get a fresh access token
      const accessToken = await this._getNewAccessToken(
        refreshToken,
        googleApiKey
      );

      // 4. Lookup the zone ID for this desk
      const zoneId = await this._lookupDeskZoneId(params.desk_id, accessToken);

      if (!zoneId) {
        throw new Error(`Desk with ID ${params.desk_id} not found. Please check the desk ID.`);
      }

      // 5. Execute the unfavorite API call with the correct zone ID
      const responseData = await this._unfavoriteDeskApiCall(
        zoneId,
        accessToken
      );

      // 5. Handle different response formats
      if (!responseData.success) {
        // Handle error responses (e.g., resource not favorited, not found, etc.)
        const errorMessage = responseData.message || 'Failed to unfavorite desk';
        return {
          content: [{
            type: 'text',
            text: `Error unfavoriting desk: ${errorMessage}`
          }],
          isError: true,
        };
      }

      // 6. Format and return the success response
      const result = {
        success: responseData.success,
        message: `Desk ${params.desk_id} (Zone ID: ${zoneId}) has been removed from your favorites.`,
        details: responseData,
      };

      return {
        content: [{
          type: 'text',
          text: `Desk unfavorited successfully! ${result.message}\n\nDetails:\n${JSON.stringify(result, null, 2)}`
        }],
      };
    } catch (error) {
      console.error('Error in handleUnfavoriteDesk:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }

  private async handleGetUserFavorites(
    request: CallToolRequest,
    extra: RequestHandlerExtra<CallToolRequest, any>
  ): Promise<CallToolResult> {
    console.log("Executing tool 'deskbird_get_user_favorites'");

    try {
      // 1. Validate environment variables
      const refreshToken = process.env.REFRESH_TOKEN;
      const googleApiKey = process.env.GOOGLE_API_KEY;

      if (!refreshToken || !googleApiKey) {
        throw new Error(
          'Server-side configuration error: REFRESH_TOKEN or GOOGLE_API_KEY is not set.'
        );
      }

      // 2. Get a fresh access token
      const accessToken = await this._getNewAccessToken(
        refreshToken,
        googleApiKey
      );

      // 3. Execute the user API call
      const userData = await this._getUserApiCall(accessToken);

      // 4. Extract favorite resources
      const favoriteResources = userData.favoriteResources || [];

      // 5. Also get floor config to provide desk ID mapping
      let deskMapping: Record<number, number> = {}; // zoneId -> deskId mapping
      try {
        const floorConfigData = await this._getFloorConfigApiCall(accessToken);
        if (floorConfigData.success && floorConfigData.data?.floorConfig) {
          const floorConfig = JSON.parse(floorConfigData.data.floorConfig);

          // Create mapping from zoneId to desk ID
          for (const area of floorConfig.areas || []) {
            if (area.desks && Array.isArray(area.desks)) {
              for (const desk of area.desks) {
                deskMapping[desk.zoneId] = desk.id;
              }
            }
          }
        }
      } catch (floorConfigError) {
        console.warn('Could not load floor config for desk ID mapping:', floorConfigError);
      }

      // 6. Enhance favorite resources with desk IDs where possible
      const enhancedFavorites = favoriteResources.map(fav => ({
        ...fav,
        deskId: deskMapping[fav.id] || null,
      }));

      // 7. Format and return the response
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
      console.error('Error in handleGetUserFavorites:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }

  private async handleGetUserInfo(
    request: CallToolRequest,
    extra: RequestHandlerExtra<CallToolRequest, any>
  ): Promise<CallToolResult> {
    console.log("Executing tool 'deskbird_get_user_info'");

    try {
      // 1. Validate environment variables
      const refreshToken = process.env.REFRESH_TOKEN;
      const googleApiKey = process.env.GOOGLE_API_KEY;

      if (!refreshToken || !googleApiKey) {
        throw new Error(
          'Server-side configuration error: REFRESH_TOKEN or GOOGLE_API_KEY is not set.'
        );
      }

      // 2. Get a fresh access token
      const accessToken = await this._getNewAccessToken(
        refreshToken,
        googleApiKey
      );

      // 3. Execute the user API call
      const userData = await this._getUserApiCall(accessToken);

      // 4. Extract the 6 most interesting user properties
      const userInfo = {
        // 1. Basic Identity
        profile: {
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          id: userData.id,
        },

        // 2. Office & Location Info
        office: {
          primaryOfficeId: userData.primaryOfficeId,
          accessibleOffices: userData.accessibleOfficeIds?.length || 0,
          role: userData.role,
        },

        // 3. Booking Preferences & Settings
        preferences: {
          language: userData.language,
          hourFormat: userData.hourFormat,
          timeZone: userData.favoriteResources?.[0]?.timeZone || 'Unknown',
          calendarInvites: userData.userSettings?.enableCalendarInvites || false,
        },

        // 4. Activity & Favorites Summary
        activity: {
          favoriteDesksCount: userData.favoriteResources?.length || 0,
          accountCreated: new Date(userData.createdAt).toLocaleDateString(),
          lastUpdated: new Date(userData.updatedAt).toLocaleDateString(),
        },

        // 5. Account Status & Type
        account: {
          status: userData.status,
          isDemoUser: userData.demoUser,
          profileType: userData.profileType,
          allowNameChange: userData.allowNameChange,
        },

        // 6. Work Setup & Groups
        workSetup: {
          userGroupIds: userData.userGroupIds?.length || 0,
          hybridWorkPolicy: userData.hybridWorkPolicyId ? 'Enabled' : 'Not set',
          dedicatedResources: userData.dedicatedResources?.length || 0,
          externalProvider: userData.externalUserData?.provider || 'Unknown',
        }
      };

      // 5. Format and return the response
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
      console.error('Error in handleGetUserInfo:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }

  private async handleGetAvailableDesks(
    request: CallToolRequest,
    extra: RequestHandlerExtra<CallToolRequest, any>
  ): Promise<CallToolResult> {
    console.log("Executing tool 'deskbird_get_available_desks'");

    try {
      // 1. Validate environment variables
      const refreshToken = process.env.REFRESH_TOKEN;
      const googleApiKey = process.env.GOOGLE_API_KEY;

      if (!refreshToken || !googleApiKey) {
        throw new Error(
          'Missing required environment variables: REFRESH_TOKEN and GOOGLE_API_KEY'
        );
      }

      // 2. Get access token
      const accessToken = await this._getNewAccessToken(refreshToken, googleApiKey);

      const floorConfigData = await this._getFloorConfigApiCall(accessToken);

      if (!floorConfigData.success || !floorConfigData.data?.floorConfig) {
        return {
          content: [{ type: 'text', text: 'Error: Could not retrieve floor configuration' }],
          isError: true,
        };
      }

      const floorConfig = JSON.parse(floorConfigData.data.floorConfig);
      const allDesks: any[] = [];

      // Collect all desks from all areas
      for (const area of floorConfig.areas || []) {
        if (area.desks && Array.isArray(area.desks)) {
          for (const desk of area.desks) {
            // Extract desk number from title (e.g., "Desk 57" -> 57)
            const deskNumberMatch = desk.title?.match(/(\d+)/);
            const deskNumber = deskNumberMatch ? parseInt(deskNumberMatch[1]) : null;

            allDesks.push({
              id: desk.id,
              title: desk.title,
              deskNumber: deskNumber,
              zoneId: desk.zoneId,
              areaName: area.name,
              status: desk.status || 'unknown'
            });
          }
        }
      }

      // Sort desks by desk number for better readability
      allDesks.sort((a, b) => {
        if (a.deskNumber !== null && b.deskNumber !== null) {
          return a.deskNumber - b.deskNumber;
        }
        const aTitle = a.title || '';
        const bTitle = b.title || '';
        return aTitle.localeCompare(bTitle);
      });

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
      console.error('Error in handleGetAvailableDesks:', error);
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

  private async _favoriteDeskApiCall(
    deskId: number,
    accessToken: string
  ): Promise<FavoriteResourceResponse> {
    const response = await fetch(`${DESKBIRD_API_BASE_URL}/user/favoriteResource`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: deskId }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Deskbird API Error:', errorBody);
      throw new Error(`Deskbird API error! status: ${response.status}`);
    }

    return await response.json();
  }

  private async _unfavoriteDeskApiCall(
    deskId: number,
    accessToken: string
  ): Promise<UnfavoriteResourceResponse> {
    const response = await fetch(`${DESKBIRD_API_BASE_URL}/user/favoriteResource/${deskId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Deskbird API Error:', errorBody);
      throw new Error(`Deskbird API error! status: ${response.status}`);
    }

    return await response.json();
  }

  private async _getUserApiCall(
    accessToken: string
  ): Promise<UserResponse> {
    const response = await fetch(`${DESKBIRD_API_BASE_URL}/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Deskbird User API Error:', errorBody);
      throw new Error(`Deskbird User API error! status: ${response.status}`);
    }

    return await response.json();
  }

  private async _getInternalWorkspacesApiCall(
    accessToken: string,
    companyId?: string
  ): Promise<any> {
    // If no company ID provided, try to extract from user data
    if (!companyId) {
      try {
        const userData = await this._getUserApiCall(accessToken);
        companyId = userData.companyId;
      } catch (error) {
        console.warn('Could not get company ID from user data:', error);
      }
    }

    if (!companyId) {
      throw new Error('Company ID is required for internal workspaces API call');
    }

    const response = await fetch(`${DESKBIRD_API_BASE_URL}/company/internalWorkspaces?companyId=${companyId}&includeInactive=false`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Deskbird Internal Workspaces API Error:', errorBody);
      throw new Error(`Deskbird Internal Workspaces API error! status: ${response.status}`);
    }

    return await response.json();
  }

  private async _discoverWorkspaceId(
    accessToken: string
  ): Promise<string> {
    try {
      // Strategy 1: Use environment variable if set
      const envWorkspaceId = process.env.DESKBIRD_WORKSPACE_ID;
      if (envWorkspaceId) {
        console.log(`Using workspace ID from environment: ${envWorkspaceId}`);
        return envWorkspaceId;
      }

      // Strategy 2: Get from user's primary office
      const userData = await this._getUserApiCall(accessToken);
      if (userData.primaryOfficeId) {
        console.log(`Using workspace ID from user's primary office: ${userData.primaryOfficeId}`);
        return userData.primaryOfficeId;
      }

      // Strategy 3: Get first accessible office
      if (userData.accessibleOfficeIds && userData.accessibleOfficeIds.length > 0) {
        const workspaceId = userData.accessibleOfficeIds[0];
        console.log(`Using first accessible workspace ID: ${workspaceId}`);
        return workspaceId;
      }

      // Strategy 4: Discover from company workspaces
      const workspacesData = await this._getInternalWorkspacesApiCall(accessToken, userData.companyId);
      const activeWorkspace = workspacesData.results?.find((ws: any) => ws.isActive && !ws.isClosed);

      if (activeWorkspace?.id) {
        console.log(`Discovered active workspace ID: ${activeWorkspace.id} (${activeWorkspace.name})`);
        return activeWorkspace.id;
      }

      throw new Error('Could not discover workspace ID using any strategy');
    } catch (error) {
      console.error('Error discovering workspace ID:', error);
      throw error;
    }
  }

  private async _getFloorConfigApiCall(
    accessToken: string
  ): Promise<any> {
    const workspaceId = process.env.DESKBIRD_WORKSPACE_ID;
    if (!workspaceId) {
      throw new Error('DESKBIRD_WORKSPACE_ID not set');
    }

    // Strategy 1: Use environment variable if set
    let groupId = process.env.DESKBIRD_GROUP_ID;

    // Strategy 2: If not set, try to derive it from user's favorite resources
    if (!groupId) {
      try {
        const userData = await this._getUserApiCall(accessToken);
        if (userData.favoriteResources && userData.favoriteResources.length > 0) {
          groupId = userData.favoriteResources[0].groupId;
          console.log(`Derived group ID ${groupId} from user's favorite resources`);
        }
      } catch (userError) {
        console.warn('Could not derive group ID from user data:', userError);
      }
    }

    // Strategy 3: Try to discover groups for this workspace
    if (!groupId) {
      try {
        const groupsResponse = await fetch(`${DESKBIRD_API_BASE_URL}/company/internalWorkspaces/${workspaceId}/groups`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json();
          // Look for an active group with floor config
          const activeGroup = groupsData.results?.find((group: any) =>
            group.isActive && group.floorConfigReady
          ) || groupsData.results?.[0]; // fallback to first group

          if (activeGroup) {
            groupId = activeGroup.id;
            console.log(`Discovered group ID ${groupId} from workspace groups`);
          }
        }
      } catch (groupsError) {
        console.warn('Could not discover groups for workspace:', groupsError);
      }
    }

    // Strategy 4: Fallback to the known working group ID
    if (!groupId) {
      groupId = '18507';
      console.warn('Using fallback group ID 18507');
    }

    console.log(`Using group ID: ${groupId} for floor config`);

    // The floor config API endpoint
    const response = await fetch(`${DESKBIRD_API_BASE_URL}/company/internalWorkspaces/${workspaceId}/groups/${groupId}/floorConfig`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Deskbird Floor Config API Error:', errorBody);
      throw new Error(`Deskbird Floor Config API error! status: ${response.status}`);
    }

    return await response.json();
  }

  private async _lookupDeskZoneId(
    deskId: number,
    accessToken: string
  ): Promise<number | null> {
    try {
      const floorConfigData = await this._getFloorConfigApiCall(accessToken);

      if (floorConfigData.success && floorConfigData.data?.floorConfig) {
        const floorConfig = JSON.parse(floorConfigData.data.floorConfig);

        // Look through all areas for desks
        for (const area of floorConfig.areas || []) {
          if (area.desks && Array.isArray(area.desks)) {
            const desk = area.desks.find((d: any) => d.id === deskId);
            if (desk) {
              console.log(`Found desk ${deskId} with zoneId ${desk.zoneId} and title "${desk.title}"`);
              return desk.zoneId;
            }
          }
        }
      }

      console.warn(`Desk ${deskId} not found in floor config`);
      return null;
    } catch (error) {
      console.error('Error looking up desk zone ID:', error);
      return null;
    }
  }

  private async _getUserFavoriteResources(
    accessToken: string
  ): Promise<any[]> {
    const userData = await this._getUserApiCall(accessToken);
    return userData.favoriteResources || [];
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
