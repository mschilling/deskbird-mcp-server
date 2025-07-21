// --- Deskbird API Types and Interfaces ---

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

export interface Address {
  radius: number;
  city: string;
  state: string;
  street: string;
  country: string;
  latitude: number;
  streetNo: string;
  timeZone: string;
  longitude: number;
  postalCode: string;
  countryCode: string;
  extra?: string;
}

export interface OpeningHours {
  [day: string]: {
    isOpen: boolean;
    midday: string;
    closingTime: string;
    openingTime: string;
    isOpen24Hours: boolean;
  };
}

export interface WorkspaceSettings {
  checkinType: 'noCheckIn' | 'simpleCheckIn' | 'geofencing';
  meetingRooms: {
    checkIn: {
      type: 'simpleCheckIn' | 'noCheckIn';
      autoCancelGracePeriodInMinutes: number;
    };
  };
  checkinGracePeriod: number;
  enableBookingsLimit: boolean;
  allowsAnonymousBooking: boolean;
  enableGeofencingCheckin: boolean;
  guestBookingCreatorRoles: string[];
  noAutoCancellationBefore: string;
  officeEventsCreatorRoles: string[];
  maximumLeadTimeForBooking: number;
  anonymizeMeetingRoomBookings: boolean;
  maximumLeadTimeForBookingConfig: {
    value: number;
    overrides: Array<{
      value: number;
      userRole: string;
    }>;
  };
  minimumTimeForAutomaticCancellation: number;
  resourcesBookableUntil: string;
}

export interface Picture {
  id: string;
  href: string;
  name: string;
  caption: string;
}

export interface Workspace {
  id: string;
  uuid: string;
  name: string;
  description: string;
  businessCompanyId: string;
  address: Address;
  pictures: Picture[];
  openingHours: OpeningHours;
  internalAccessByDomain: string[];
  isActive: boolean;
  isRestricted: boolean;
  settings: WorkspaceSettings;
  demoBookingStatus?: string;
  checkinSettings: {
    other: boolean;
    parking: boolean;
    flexDesk: boolean;
    meetingRoom: boolean;
  };
  createdAt: number;
  userGroupIds: string[];
}

export interface Group {
  id: string;
  name: string;
  order: number;
  workspaceId: string;
  isActive: boolean;
  image?: string;
  color?: string;
  floorConfig?: string;
  floorConfigReady: boolean;
  interactiveImage?: string;
}

export interface AccessRules {
  isBookable: boolean;
  userHasAccess: boolean;
  isRestricted: boolean;
}

export interface ExternalData {
  provider: 'internal' | 'external';
  resourceId: string;
  resourceEmail: string;
}

export interface Quantity {
  total: number;
  groupId: string;
  forInternal: number;
}

export interface Resource {
  id: string;
  workspaceId: string;
  name: string;
  type: 'flexDesk' | 'meetingRoom' | 'parking' | 'other';
  capacity: number;
  description: string;
  quantity: Quantity;
  isBookable: boolean;
  maximumLeadTimeForBooking: number;
  groupId: string;
  isActive: boolean;
  createdAt: number;
  isRestricted: boolean;
  isHidden: boolean;
  usersWithAccess: string[];
  restrictedTime: number;
  isTimeRestricted: boolean;
  order: number;
  group: Group;
  externalData: ExternalData;
  images: any[];
  amenities: any[];
  resourcesBookableUntil: string;
  accessRules: AccessRules;
}

export interface AccessInfo {
  type: 'SHARED' | 'DEDICATED' | 'RESTRICTED';
}

export interface ZoneItem {
  id: number;
  resourceType: 'flexDesk' | 'meetingRoom' | 'parking' | 'other';
  capacity: number;
  isAvailabilityKnown: boolean;
  name: string;
  description: string;
  hashId: string;
  status: 'active' | 'inactive';
  order: number;
  isBookable: boolean;
  zoneId: string;
  floorId: number;
  officeId: string;
  accessInfo: AccessInfo;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  zoneId: string;
  resourceId: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
  user: User;
  workspaceId: string;
  bookingStatus: 'accepted' | 'running' | 'completed' | 'cancelled' | 'pending';
  checkInStatus: 'checkInNotAvailable' | 'checkedIn' | 'notCheckedIn';
  bookingStartTime: number;
  bookingEndTime: number;
  lastUpdatedByUserId: string;
  isDayPass: boolean;
  cancelledByUserId?: string;
  cancelledBy: string;
  zoneItemId: number;
  zoneItemName: string;
  calendarEventId: string;
  googleCalendarEventId: string;
  microsoftCalendarEventId: string;
  isAnonymousBooking: boolean;
  bookingAutoCancellationTime?: number;
  earlyReleaseEndTime?: number;
  deleted: boolean;
  past: boolean;
  companyId: string;
  demoBooking: boolean;
  createdByUserId: number;
  isMultiDayBooking: boolean;
  anonymized: boolean;
  uuid: string;
  guestId?: string;
  guest?: any;
  workspace: Workspace;
  resource: Resource;
  zone: Resource; // Same structure as resource
  zoneItem: ZoneItem;
  bookingTitle?: string;
}

export interface BookingResponse {
  success: boolean;
  data: {
    booking: Booking;
  };
}

export interface BookingsListResponse {
  totalCount: number;
  maximumCountPerPage: number;
  currentCount: number;
  next: string;
  previous: string;
  success: boolean;
  results: Booking[];
}

export interface CreateBookingRequest {
  bookings: Array<{
    bookingStartTime: number;
    bookingEndTime: number;
    isAnonymous: boolean;
    resourceId: string;
    zoneItemId: number;
    workspaceId: string;
  }>;
}

export interface CreateBookingResponse {
  successfulBookings: Booking[];
  failedBookings: Array<{
    error: string;
    booking: any;
  }>;
}

// Tool-specific types
export interface BookDeskParams {
  date: string;
  desk_id: number;
}

export interface GetUserBookingsParams {
  skip?: number;
  limit?: number;
  include_instances?: boolean;
  upcoming?: boolean;
}

export interface FavoriteDeskParams {
  desk_id: number;
}

export interface UnfavoriteDeskParams {
  desk_id: number;
}

export interface GetUserFavoritesParams {
  // No parameters needed for this endpoint
}

export interface GetUserInfoParams {
  // No parameters needed for this endpoint
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
  officeRoles: any[];
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

export interface ToolResult {
  success: boolean;
  message: string;
  details?: any;
}

export interface PaginationInfo {
  totalCount: number;
  currentCount: number;
  maximumCountPerPage: number;
  next: string;
  previous: string;
}

export interface GetUserBookingsResult extends ToolResult {
  pagination: PaginationInfo;
  bookings: Booking[];
}
