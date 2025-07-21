// --- Booking Related Types ---

import type { Workspace, Resource, ZoneItem } from './core.js';
import type { User } from './user.js';

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
