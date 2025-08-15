import { DateTime } from 'luxon';

/**
 * Date and time utilities for Deskbird API
 */
export class DateUtils {
  private static readonly DEFAULT_TIMEZONE = 'Europe/Amsterdam';
  private static readonly WORK_START_HOUR = 9;
  private static readonly WORK_END_HOUR = 18;

  /**
   * Parse and validate a date string
   */
  static parseDate(dateString: string, timezone: string = this.DEFAULT_TIMEZONE): DateTime {
    const date = DateTime.fromISO(dateString, { zone: timezone });
    
    if (!date.isValid) {
      throw new Error(`Invalid date format: '${dateString}'. Please use YYYY-MM-DD.`);
    }
    
    return date;
  }

  /**
   * Check if a date is a weekend
   */
  static isWeekend(date: DateTime): boolean {
    return date.weekday === 6 || date.weekday === 7; // Saturday or Sunday
  }

  /**
   * Check if a date is a weekday
   */
  static isWeekday(date: DateTime): boolean {
    return !this.isWeekend(date);
  }

  /**
   * Get default work hours for a given date
   */
  static getWorkHours(
    date: DateTime,
    startHour: number = this.WORK_START_HOUR,
    endHour: number = this.WORK_END_HOUR
  ): { start: DateTime; end: DateTime } {
    return {
      start: date.set({ hour: startHour, minute: 0, second: 0, millisecond: 0 }),
      end: date.set({ hour: endHour, minute: 0, second: 0, millisecond: 0 }),
    };
  }

  /**
   * Convert DateTime to milliseconds timestamp (for Deskbird API)
   */
  static toTimestamp(date: DateTime): number {
    return date.toMillis();
  }

  /**
   * Convert milliseconds timestamp to DateTime
   */
  static fromTimestamp(timestamp: number, timezone: string = this.DEFAULT_TIMEZONE): DateTime {
    return DateTime.fromMillis(timestamp, { zone: timezone });
  }

  /**
   * Get current date in the default timezone
   */
  static now(timezone: string = this.DEFAULT_TIMEZONE): DateTime {
    return DateTime.now().setZone(timezone);
  }

  /**
   * Get today's date in the default timezone (time set to midnight)
   */
  static today(timezone: string = this.DEFAULT_TIMEZONE): DateTime {
    return this.now(timezone).startOf('day');
  }

  /**
   * Format date for display
   */
  static formatDate(date: DateTime, format: string = 'yyyy-MM-dd'): string {
    return date.toFormat(format);
  }

  /**
   * Get today's date as a string in YYYY-MM-DD format
   */
  static getTodayDateString(timezone: string = this.DEFAULT_TIMEZONE): string {
    return this.today(timezone).toFormat('yyyy-MM-dd');
  }

  /**
   * Generate full day time range (7 AM to 11 PM) for a given date
   * Used for zone availability queries
   */
  static generateDayTimeRange(
    dateString: string, 
    timezone: string = this.DEFAULT_TIMEZONE
  ): { startTime: number; endTime: number } {
    const date = this.parseDate(dateString, timezone);
    
    // 7:00 AM to 11:00 PM (16-hour window)
    const startTime = date.set({ hour: 7, minute: 0, second: 0, millisecond: 0 });
    const endTime = date.set({ hour: 23, minute: 0, second: 0, millisecond: 0 });
    
    return {
      startTime: this.toTimestamp(startTime),
      endTime: this.toTimestamp(endTime),
    };
  }

  /**
   * Validate booking date (not in the past, not on weekend, etc.)
   */
  static validateBookingDate(
    dateString: string,
    options: {
      allowWeekends?: boolean;
      allowPastDates?: boolean;
      timezone?: string;
    } = {}
  ): {
    isValid: boolean;
    date?: DateTime;
    errors: string[];
  } {
    const {
      allowWeekends = false,
      allowPastDates = false,
      timezone = this.DEFAULT_TIMEZONE,
    } = options;

    const errors: string[] = [];
    let date: DateTime;

    try {
      date = this.parseDate(dateString, timezone);
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Invalid date format'],
      };
    }

    // Check if date is in the past
    if (!allowPastDates && date < this.today(timezone)) {
      errors.push('Booking date cannot be in the past');
    }

    // Check if date is on weekend
    if (!allowWeekends && this.isWeekend(date)) {
      errors.push('Booking date falls on a weekend');
    }

    return {
      isValid: errors.length === 0,
      date,
      errors,
    };
  }
}
