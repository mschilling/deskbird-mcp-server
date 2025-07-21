// --- Core Deskbird API Domain Types ---

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
