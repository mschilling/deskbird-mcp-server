import type { FavoriteResource, UserResponse } from '../types/index.js';
import { getVersionedEndpoint } from '../utils/api-paths.js';
import { handleDeskbirdException } from '../utils/error-handler.js';
import type { HttpClient } from '../utils/http-client.js';

/**
 * User API client for user-related operations
 */
export class UserApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<UserResponse> {
    console.log('[User API] Getting current user information');
    
    try {
      const response = await this.client.get<UserResponse>(
        getVersionedEndpoint('USER_PROFILE', '/user')
      );
      
      if (!response.success || !response.data) {
        throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
      }
      
      return response.data;
    } catch (error: unknown) {
      handleDeskbirdException(error, 'getCurrentUser');
    }
  }

  /**
   * Get user's favorite resources
   */
  async getUserFavorites(): Promise<FavoriteResource[]> {
    console.log('[User API] Getting user favorite resources');
    
    try {
      const userData = await this.getCurrentUser();
      return userData.favoriteResources || [];
    } catch (error: unknown) {
      handleDeskbirdException(error, 'getUserFavorites');
    }
  }

  /**
   * Get user profile summary with key information
   */
  async getUserProfile(): Promise<{
    profile: {
      name: string;
      email: string;
      id: string;
    };
    office: {
      primaryOfficeId: string;
      accessibleOffices: number;
      role: string;
    };
    preferences: {
      language: string;
      hourFormat: string;
      timeZone: string;
      calendarInvites: boolean;
    };
    activity: {
      favoriteDesksCount: number;
      accountCreated: string;
      lastUpdated: string;
    };
    account: {
      status: string;
      isDemoUser: boolean;
      profileType: string;
      allowNameChange: boolean;
    };
    workSetup: {
      userGroupIds: number;
      hybridWorkPolicy: string;
      dedicatedResources: number;
      externalProvider: string;
    };
  }> {
    console.log('[User API] Getting user profile summary');
    
    try {
      const userData = await this.getCurrentUser();
      
      return {
        profile: {
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email || '',
          id: userData.id || '',
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
        },
      };
    } catch (error: unknown) {
      handleDeskbirdException(error, 'getUserProfile');
    }
  }
}
