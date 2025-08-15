# Spatial Awareness Endpoints

This document provides comprehensive documentation for the spatial awareness capabilities of the Deskbird MCP Server, enabling "office social radar" functionality and proximity-based desk management.

## Overview

The spatial awareness system consists of two main endpoints that work together to provide real-time office occupancy insights and spatial relationship analysis:

1. **Zone Availability**: Real-time desk occupancy and availability
2. **Floor Configuration**: Static floor plan layout with desk coordinates

These endpoints enable intelligent queries like:
- "Who's sitting near me today?"
- "Find available desks near my team"
- "When will nearby desks be free?"
- "Show me the seating map for this afternoon"

## Endpoints

### 1. Zone Availability Endpoint

**Tool Name**: `deskbird_get_zone_availability`

**Purpose**: Get real-time desk availability and occupancy for a zone within a specific time range.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspace_id` | string | ✅ | The workspace/office identifier (e.g., "1234") |
| `zone_id` | string | ✅ | The zone/area identifier (e.g., "5678" for main workspace area) |
| `start_time` | number | ❌ | Start time as Unix timestamp in milliseconds |
| `end_time` | number | ❌ | End time as Unix timestamp in milliseconds |
| `date` | string | ❌ | Date in YYYY-MM-DD format. Auto-generates 7AM-11PM range |

#### Default Behavior

- **Time Range**: If no time parameters provided, defaults to today 7:00 AM - 11:00 PM
- **Date Override**: If `date` is provided, it overrides `start_time`/`end_time`
- **Timezone**: All times use Europe/Amsterdam timezone

#### Response Structure

```json
{
  "id": "5678",
  "name": "Main Floor",
  "type": "flexDesk",
  "capacity": 50,
  "total": 50,
  "totalAvailable": 32,
  "availability": {
    "used": 18,
    "total": 50,
    "available": 32,
    "users": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "id": "12345",
        "userId": "12345",
        "uuid": "uuid-example-1234",
        "color": "#6286E6",
        "bookingId": "98765",
        "startTime": 1755500400000,
        "endTime": 1755532800000,
        "isFullDay": false,
        "avatarUrl": "https://example.com/avatar.jpg"
      }
    ],
    "zoneItems": [
      {
        "id": 987654,
        "name": "Desk 42",
        "description": "",
        "users": [...],
        "order": 42,
        "status": "active",
        "isAvailable": false,
        "accessInfo": {"type": "SHARED"},
        "resourceType": "flexDesk"
      }
    ]
  }
}
```

#### Key Data Points

- **Real-time Availability**: `isAvailable` field for each desk
- **Current Occupants**: Full user details with booking times
- **Booking Overlap**: Time range filtering shows overlapping bookings
- **Desk Metadata**: Order numbers, access info, and status

#### Example Usage

```bash
# Get current availability for main workspace
deskbird_get_zone_availability workspace_id="1234" zone_id="5678"

# Get availability for specific date
deskbird_get_zone_availability workspace_id="1234" zone_id="5678" date="2025-08-18"

# Custom time range (morning meeting planning)
deskbird_get_zone_availability workspace_id="1234" zone_id="5678" start_time=1755500400000 end_time=1755514800000
```

### 2. Floor Configuration Endpoint

**Tool Name**: `deskbird_get_floor_config`

**Purpose**: Retrieve detailed floor plan configuration including exact desk coordinates and zone layout for spatial analysis.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspace_id` | string | ✅ | The workspace/office identifier (e.g., "1234") |
| `group_id` | string | ✅ | The floor/group identifier within the workspace (e.g., "9876") |

#### Response Structure

```json
{
  "id": "9876",
  "name": "Main Floor",
  "order": 1,
  "workspaceId": "1234",
  "isActive": true,
  "image": "",
  "color": "",
  "floorConfig": "{...}", // JSON string containing layout
  "floorConfigReady": true,
  "interactiveImage": "https://example.com/floorplan.png"
}
```

#### Floor Config JSON Structure

The `floorConfig` field contains a JSON string with this structure:

```json
{
  "areas": [
    {
      "id": "5678",
      "title": "Main Area",
      "color": "#79BEF6",
      "active": true,
      "points": [[-1,-1.5], [0,697.5], [516.29,697.49], [516.29,-1.51]],
      "type": "flexDesk",
      "desks": [
        {
          "id": 42,
          "zoneId": 987654,
          "title": "Desk 42",
          "type": "flexDesk",
          "active": true,
          "position": [350.0, 150.0]
        }
      ]
    }
  ],
  "deskRadius": 6,
  "scale": 1
}
```

#### Coordinate System

- **Origin**: Top-left corner (0, 0)
- **Units**: Pixels relative to floor plan image
- **X-axis**: Left to right (horizontal)
- **Y-axis**: Top to bottom (vertical)
- **Distance**: Euclidean distance between desk positions

#### Example Usage

```bash
# Get floor layout for main workspace
deskbird_get_floor_config workspace_id="1234" group_id="9876"
```

## Spatial Analysis Functions

The `SpatialUtils` class provides helper functions for analyzing desk relationships:

### Distance Calculations

```typescript
// Calculate distance between two desks
const distance = SpatialUtils.calculateDeskDistance([350.0, 150.0], [320.0, 150.0]);

// Find desks within 30 pixels
const nearbyDesks = SpatialUtils.findDesksWithinRadius(42, allDesks, 30);
```

### Proximity Analysis

```typescript
// Find desks in same row (within 5 pixels Y-coordinate)
const rowDesks = SpatialUtils.findDesksInSameRow(42, allDesks, 5);

// Find closest available desks
const availableNearby = SpatialUtils.findClosestAvailableDesks(42, allDesks, occupancyData, 5);
```

### Social Radar

```typescript
// Find who's sitting near a specific desk
const colleagues = SpatialUtils.findNearbyColleagues(42, allDesks, occupancyData, 50);

// Generate complete spatial summary
const summary = SpatialUtils.generateDeskSpatialSummary(42, floorConfig, occupancyData);
```

## Use Cases and Query Examples

### 1. "Who's Sitting Near Me?"

**Scenario**: User wants to know who's currently nearby

**Implementation**:
1. Get current zone availability for today
2. Get floor configuration for coordinates
3. Use spatial utils to find nearby occupied desks
4. Return colleague information with distances

**Query Flow**:
```
Zone Availability → Floor Config → Spatial Analysis → Colleague List
```

### 2. "Find Available Desks Near My Team"

**Scenario**: User wants to book a desk close to team members

**Implementation**:
1. Find team members' current desk bookings
2. Get floor coordinates for team desks
3. Find available desks within radius of team cluster
4. Sort by proximity and return options

### 3. "When Will Nearby Desks Be Free?"

**Scenario**: Planning for afternoon collaboration

**Implementation**:
1. Get zone availability for extended time range
2. Analyze booking time overlaps
3. Find desks that become available during desired period
4. Calculate proximity to user's current/preferred location

### 4. "Office Seating Map for This Afternoon"

**Scenario**: Visual overview of office occupancy

**Implementation**:
1. Get zone availability for afternoon time range
2. Overlay occupancy data on floor coordinates
3. Generate spatial summary with availability clusters
4. Highlight team locations and available areas

## Common Patterns

### Desk Identification Mapping

Different APIs use different desk identifiers:

| Context | Identifier | Example | Usage |
|---------|------------|---------|--------|
| Floor Config | `desk.id` | 42 | Display names, coordinates |
| Zone Items | `zoneItem.order` | 42 | Booking correlation |
| Booking API | `desk.zoneId` | 987654 | Actual booking operations |

### Time Range Strategies

| Scenario | Start Time | End Time | Purpose |
|----------|------------|----------|---------|
| Current occupancy | Now | Now + 1 hour | Real-time queries |
| Full day | 7:00 AM | 11:00 PM | Daily planning |
| Meeting window | Meeting start - 30min | Meeting end + 30min | Meeting room planning |
| Week ahead | Monday 7 AM | Friday 11 PM | Weekly scheduling |

### Distance Thresholds

| Distance (pixels) | Relationship | Use Case |
|-------------------|--------------|----------|
| 0-20 | Adjacent | Immediate neighbors |
| 21-40 | Same cluster | Team seating |
| 41-60 | Same area | Department grouping |
| 61+ | Different section | Cross-team visibility |

## Error Handling

### Common Errors

1. **Invalid Workspace/Zone ID**: Returns 404 or access denied
2. **Malformed Time Range**: Validation error with helpful message
3. **Floor Config Not Ready**: `floorConfigReady: false` in response
4. **No Desk Found**: Spatial functions throw descriptive errors

### Best Practices

1. **Always validate parameters** before making API calls
2. **Cache floor configuration** - it changes infrequently
3. **Handle timezone conversion** - all times in Europe/Amsterdam
4. **Graceful degradation** - provide fallbacks for missing data

## Rate Limiting and Performance

- **Zone Availability**: Real-time data, reasonable caching (5-10 minutes)
- **Floor Config**: Static data, longer caching (1-4 hours)
- **Spatial Calculations**: Client-side, no API calls needed
- **Batch Queries**: Combine multiple time ranges when possible

## Integration Examples

### Smart Desk Booking

```typescript
// Find best available desk near user's team
async function findOptimalDesk(userId: string, teamUserIds: string[]) {
  const occupancy = await getZoneAvailability(workspaceId, zoneId);
  const floorConfig = await getFloorConfig(workspaceId, groupId);
  
  // Find team desk locations
  const teamDesks = findTeamDesks(teamUserIds, occupancy);
  
  // Find available desks near team cluster
  const availableNearby = findAvailableDesksNearTeam(teamDesks, floorConfig, occupancy);
  
  return availableNearby[0]; // Best option
}
```

### Social Radar Dashboard

```typescript
// Generate comprehensive office social map
async function generateSocialMap(currentUserId: string) {
  const occupancy = await getZoneAvailability(workspaceId, zoneId);
  const floorConfig = await getFloorConfig(workspaceId, groupId);
  
  const userDesk = findUserCurrentDesk(currentUserId, occupancy);
  const socialMap = SpatialUtils.generateDeskSpatialSummary(
    userDesk.id, 
    floorConfig, 
    occupancy
  );
  
  return {
    yourLocation: userDesk,
    nearbyColleagues: socialMap.nearbyColleagues,
    availableOptions: socialMap.availableNearby,
    interactiveMap: floorConfig.interactiveImage
  };
}
```

## Conclusion

The spatial awareness endpoints transform the Deskbird MCP server from a basic booking tool into an intelligent office social radar system. By combining real-time occupancy data with precise spatial coordinates, users can make informed decisions about where to sit, when to collaborate, and how to optimize their office experience.

The system enables natural language queries about physical office relationships and provides the foundation for advanced features like team clustering optimization, noise level prediction, and social collaboration facilitation.