/**
 * Spatial utility functions for desk proximity and coordinate calculations
 */

export interface DeskPosition {
  id: number;
  zoneId: number;
  title: string;
  position: [number, number]; // [x, y] coordinates
}

export interface ZoneAvailabilityData {
  id: string;
  name: string;
  type: string;
  capacity: number;
  totalAvailable: number;
  availability: {
    used: number;
    total: number;
    available: number;
    users: Array<{
      firstName: string;
      lastName: string;
      email: string;
      id: string;
      userId: string;
      uuid: string;
      color: string;
      bookingId: string;
      startTime: number;
      endTime: number;
      isFullDay: boolean;
      avatarUrl?: string;
    }>;
    zoneItems: Array<{
      id: number;
      name: string;
      description: string;
      users: Array<{
        firstName: string;
        lastName: string;
        email: string;
        id: string;
        userId: string;
        uuid: string;
        color: string;
        bookingId: string;
        startTime: number;
        endTime: number;
        isFullDay: boolean;
        avatarUrl?: string;
      }>;
      order: number;
      status: string;
      isAvailable: boolean;
      accessInfo: { type: string };
      resourceType: string;
    }>;
  };
}

export interface FloorConfigData {
  id: string;
  name: string;
  order: number;
  workspaceId: string;
  isActive: boolean;
  image: string;
  color: string;
  floorConfig: string; // JSON string
  floorConfigReady: boolean;
  interactiveImage: string;
}

export interface ParsedFloorConfig {
  areas: Array<{
    id: string;
    title: string;
    color: string;
    active: boolean;
    points: number[][];
    type: string;
    desks: DeskPosition[];
  }>;
  deskRadius: number;
  scale: number;
}

/**
 * Spatial utilities for office desk management
 */
export class SpatialUtils {
  /**
   * Calculate Euclidean distance between two desk positions
   */
  static calculateDeskDistance(position1: [number, number], position2: [number, number]): number {
    const dx = position1[0] - position2[0];
    const dy = position1[1] - position2[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Find desks within a specified distance from a target desk
   */
  static findDesksWithinRadius(
    targetDeskId: number,
    desks: DeskPosition[],
    maxDistance: number = 30
  ): Array<DeskPosition & { distance: number }> {
    const targetDesk = desks.find(d => d.id === targetDeskId);
    if (!targetDesk) {
      throw new Error(`Target desk ${targetDeskId} not found`);
    }

    return desks
      .filter(desk => desk.id !== targetDeskId)
      .map(desk => ({
        ...desk,
        distance: this.calculateDeskDistance(targetDesk.position, desk.position)
      }))
      .filter(desk => desk.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Find desks in the same row (similar Y coordinate)
   */
  static findDesksInSameRow(
    targetDeskId: number,
    desks: DeskPosition[],
    tolerance: number = 5
  ): DeskPosition[] {
    const targetDesk = desks.find(d => d.id === targetDeskId);
    if (!targetDesk) {
      throw new Error(`Target desk ${targetDeskId} not found`);
    }

    return desks.filter(desk => 
      desk.id !== targetDeskId &&
      Math.abs(desk.position[1] - targetDesk.position[1]) <= tolerance
    );
  }

  /**
   * Find the closest available desks to a target desk
   */
  static findClosestAvailableDesks(
    targetDeskId: number,
    desks: DeskPosition[],
    occupancyData: ZoneAvailabilityData,
    count: number = 5
  ): Array<DeskPosition & { distance: number; isAvailable: boolean }> {
    const targetDesk = desks.find(d => d.id === targetDeskId);
    if (!targetDesk) {
      throw new Error(`Target desk ${targetDeskId} not found`);
    }

    // Create a map of desk availability from zone items
    const availabilityMap = new Map<number, boolean>();
    occupancyData.availability.zoneItems.forEach(item => {
      // Map from zone item order to desk availability
      const desk = desks.find(d => d.id === item.order);
      if (desk) {
        availabilityMap.set(desk.id, item.isAvailable);
      }
    });

    return desks
      .filter(desk => desk.id !== targetDeskId)
      .map(desk => ({
        ...desk,
        distance: this.calculateDeskDistance(targetDesk.position, desk.position),
        isAvailable: availabilityMap.get(desk.id) ?? false
      }))
      .filter(desk => desk.isAvailable)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count);
  }

  /**
   * Find who is sitting near a specific desk
   */
  static findNearbyColleagues(
    targetDeskId: number,
    desks: DeskPosition[],
    occupancyData: ZoneAvailabilityData,
    radius: number = 50
  ): Array<{
    desk: DeskPosition;
    distance: number;
    users: Array<{
      firstName: string;
      lastName: string;
      email: string;
      id: string;
      bookingId: string;
      startTime: number;
      endTime: number;
    }>;
  }> {
    const targetDesk = desks.find(d => d.id === targetDeskId);
    if (!targetDesk) {
      throw new Error(`Target desk ${targetDeskId} not found`);
    }

    // Create a map of desk occupancy from zone items
    const occupancyMap = new Map<number, any[]>();
    occupancyData.availability.zoneItems.forEach(item => {
      const desk = desks.find(d => d.id === item.order);
      if (desk && item.users.length > 0) {
        occupancyMap.set(desk.id, item.users);
      }
    });

    return desks
      .filter(desk => desk.id !== targetDeskId)
      .map(desk => ({
        desk,
        distance: this.calculateDeskDistance(targetDesk.position, desk.position),
        users: occupancyMap.get(desk.id) || []
      }))
      .filter(item => item.distance <= radius && item.users.length > 0)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Parse floor config JSON string
   */
  static parseFloorConfig(floorConfigString: string): ParsedFloorConfig {
    try {
      return JSON.parse(floorConfigString);
    } catch (error) {
      throw new Error(`Failed to parse floor config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get desk by ID from floor config
   */
  static findDeskInFloorConfig(deskId: number, floorConfig: ParsedFloorConfig): DeskPosition | null {
    for (const area of floorConfig.areas) {
      const desk = area.desks.find(d => d.id === deskId);
      if (desk) {
        return desk;
      }
    }
    return null;
  }

  /**
   * Check if two booking time ranges overlap
   */
  static hasTimeOverlap(
    booking1: { startTime: number; endTime: number },
    booking2: { startTime: number; endTime: number }
  ): boolean {
    return booking1.startTime < booking2.endTime && booking2.startTime < booking1.endTime;
  }

  /**
   * Generate a summary of spatial relationships for a desk
   */
  static generateDeskSpatialSummary(
    targetDeskId: number,
    floorConfig: ParsedFloorConfig,
    occupancyData: ZoneAvailabilityData
  ): {
    targetDesk: DeskPosition | null;
    nearbyDesks: Array<DeskPosition & { distance: number }>;
    availableNearby: Array<DeskPosition & { distance: number }>;
    nearbyColleagues: Array<{
      desk: DeskPosition;
      distance: number;
      users: any[];
    }>;
    sameRowDesks: DeskPosition[];
  } {
    const allDesks = floorConfig.areas.flatMap(area => area.desks);
    const targetDesk = this.findDeskInFloorConfig(targetDeskId, floorConfig);

    if (!targetDesk) {
      return {
        targetDesk: null,
        nearbyDesks: [],
        availableNearby: [],
        nearbyColleagues: [],
        sameRowDesks: []
      };
    }

    return {
      targetDesk,
      nearbyDesks: this.findDesksWithinRadius(targetDeskId, allDesks, 50),
      availableNearby: this.findClosestAvailableDesks(targetDeskId, allDesks, occupancyData, 5),
      nearbyColleagues: this.findNearbyColleagues(targetDeskId, allDesks, occupancyData, 50),
      sameRowDesks: this.findDesksInSameRow(targetDeskId, allDesks, 5)
    };
  }
}