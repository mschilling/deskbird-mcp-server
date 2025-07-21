// --- User and Favorites Related Types ---

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  primaryEmail?: string;
  avatarColor: string;
  userGroupIds: string[];
  profileImage: string;
  firebaseId: string;
  expirationDate?: number;
  status: 'active' | 'inactive';
  role: 'user' | 'admin' | 'officeAdmin' | 'manager' | 'groupManager';
  signup: boolean;
  companyId: string;
  userSettings: {
    app: {
      enableTracking: {
        jimo: boolean;
        mixpanel: boolean;
        necessary: boolean;
        googleAnalytics: boolean;
      };
    };
    enableCalendarInvites: boolean;
    enableCheckInReminderPN: boolean;
    enableCheckInReminderEmail: boolean;
    bookingSettings: Record<string, any>;
  };
  externalUserData: {
    id: string;
    jobTitle?: string;
    provider: string;
    department?: string;
    displayName: string;
    mobilePhone?: string;
    officeLocation?: string;
    preferredLanguage?: string;
    syncExternalImage: boolean;
  };
  primaryOfficeId: string;
  favourites: string[];
  demoUser: boolean;
  favoriteDesks: any[];
  roleLastChangedBy?: string;
  createdAt: number;
  updatedAt: number;
  isUsingSystemLanguage: boolean;
  dedicatedResources: Record<string, any>;
  initialDeviceLanguage: string;
  language: string;
  uuid: string;
  profileType: 'public' | 'private';
  hourFormat: '12hour' | '24hour';
  hrisUserId?: string;
  hrisCompanyId?: string;
  favoriteResources: Array<{
    id: string;
    autoBook: boolean;
  }>;
  hybridWorkPolicyId?: string;
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  primaryEmail: string;
  avatarColor: string;
  userGroupIds: string[];
  profileImage: string;
  firebaseId: string;
  expirationDate: number;
  status: string;
  role: string;
  signup: boolean;
  companyId: string;
  userSettings: {
    app: {
      enableTracking: {
        jimo: boolean;
        mixpanel: boolean;
        necessary: boolean;
        googleAnalytics: boolean;
      };
    };
    enableCalendarInvites: boolean;
    enableCheckInReminderPN: boolean;
    enableCheckInReminderEmail: boolean;
    bookingSettings: Record<string, any>;
    enableScheduleReminderPN?: boolean;
    enableScheduleReminderEmail?: boolean;
    enableOfficePlanningForOthersPN?: boolean;
    enableOfficePlanningForOthersEmail?: boolean;
  };
  externalUserData: {
    id: string;
    jobTitle: string;
    provider: string;
    department: string;
    displayName: string;
    mobilePhone: string;
    officeLocation: string;
    preferredLanguage: string;
    syncExternalImage: boolean;
  };
  primaryOfficeId: string;
  favourites: string[];
  demoUser: boolean;
  favoriteDesks: FavoriteDesk[];
  roleLastChangedBy: string;
  createdAt: number;
  updatedAt: number;
  isUsingSystemLanguage: boolean;
  dedicatedResources: DedicatedResource[];
  initialDeviceLanguage: string;
  language: string;
  uuid: string;
  profileType: string;
  hourFormat: string;
  hrisUserId?: string | null;
  hrisCompanyId?: string | null;
  favoriteResources: FavoriteResource[];
  hybridWorkPolicyId?: string | null;
  allowNameChange: boolean;
  allowPasswordReset: boolean;
  accessibleOfficeIds: string[];
  officeIds: string[];
  managedGroups: ManagedGroup[];
  officeRoles: OfficeRole[];
}

export interface UserResponse {
  success?: boolean;
  data?: UserData;
  // For direct user endpoint, the response is the user data directly
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  favoriteResources?: FavoriteResource[];
  [key: string]: any;
}

export interface OfficeRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface FavoriteDesk {
  id: string;
  name: string;
  [key: string]: any;
}

export interface DedicatedResource {
  id: string;
  name: string;
  [key: string]: any;
}

export interface ManagedGroup {
  id: string;
  name: string;
  [key: string]: any;
}

export interface FavoriteResource {
  id: number;
  zoneId: string;
  name: string;
  resourceType: string;
  status: string;
  zoneName: string;
  zoneIsActive: boolean;
  groupId: string;
  groupName: string;
  groupIsActive: boolean;
  floorConfigReady: boolean;
  officeName: string;
  officeId: string;
  officeIsActive: boolean;
  companyId: string;
  autoBook: boolean;
  timeZone: string;
  isOfficeRestricted: boolean;
  officeUserGroupIds: string[];
  isZoneRestricted: boolean;
  zoneUsersWithAccess: string[];
}

export interface FavoriteResourceResponse {
  success: boolean;
  data?: {
    id: number;
    zoneId: string;
    name: string;
    status: string;
    resourceType: string;
    zoneName: string;
    zoneIsActive: boolean;
    groupId: string;
    groupName: string;
    groupIsActive: boolean;
    floorConfigReady: boolean;
    officeName: string;
    officeId: string;
    officeIsActive: boolean;
    companyId: string;
    isOfficeRestricted: boolean;
    officeUserGroupIds: string[];
    isZoneRestricted: boolean;
    zoneUsersWithAccess: string[];
    autoBook: boolean;
  };
  message?: string;
  errorCode?: string;
}

export interface UnfavoriteResourceResponse {
  success: boolean;
  message?: string;
  errorCode?: string;
}
