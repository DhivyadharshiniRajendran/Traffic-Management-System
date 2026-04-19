// ─────────────────────────────────────────────
// FILE: src/engine/reservationManager.js
// PURPOSE: Manage lane reservations — only 1 robot per reservable lane at a time
// ─────────────────────────────────────────────

// Map of laneId → robotId that holds the reservation
const reservations = new Map();

export function resetReservations() {
  reservations.clear();
}

export function requestReservation(robot, lane, tick) {
  if (!lane.requiresReservation) {
    return { granted: true };
  }

  const holder = reservations.get(lane.id);

  // Already reserved by this robot
  if (holder === robot.id) {
    return { granted: true };
  }

  // Reserved by another robot
  if (holder && holder !== robot.id) {
    return {
      granted: false,
      event: {
        tick,
        type: 'reservation_denied',
        robotId: robot.id,
        detail: `Reservation denied for lane ${lane.id} (held by ${holder})`,
      },
    };
  }

  // Grant reservation
  reservations.set(lane.id, robot.id);
  robot.reservedLaneIds.push(lane.id);
  return { granted: true };
}

export function releaseReservation(robot, laneId) {
  const holder = reservations.get(laneId);
  if (holder === robot.id) {
    reservations.delete(laneId);
  }
  robot.reservedLaneIds = robot.reservedLaneIds.filter(id => id !== laneId);
}

export function isLaneReserved(laneId) {
  return reservations.has(laneId);
}

export function getReservationHolder(laneId) {
  return reservations.get(laneId);
}

export function getMaxOccupants(lane) {
  switch (lane.laneType) {
    case 'narrow': return 1;
    case 'human_zone': return 1;
    case 'intersection': return 2;
    case 'normal': return 3;
    default: return 3;
  }
}

export function canEnterLane(robot, lane, tick, robots = []) {
  const max = getMaxOccupants(lane);

  // Emergency vehicle absolute priority
  if (!robot.emergencyStopRequested) {
    const activeEmergencyRobots = robots.filter(r => r.emergencyStopRequested && r.status === 'moving');
    if (activeEmergencyRobots.length > 0) {
      const myNextWp = robot.path[robot.pathIndex + 1];
      for (const eRobot of activeEmergencyRobots) {
        // Find if my target intersects the emergency robot's remaining path
        const eFutureWps = eRobot.path.slice(eRobot.pathIndex);
        if (eFutureWps.includes(myNextWp)) {
          return {
            allowed: false,
            event: {
              tick,
              type: 'reservation_denied',
              robotId: robot.id,
              detail: `Yielding right-of-way to emergency vehicle ${eRobot.name}`,
            },
          };
        }
      }
    }
  }

  // Check occupancy limit
  if (lane.currentOccupants.length >= max && !lane.currentOccupants.includes(robot.id)) {
    return {
      allowed: false,
      event: {
        tick,
        type: 'reservation_denied',
        robotId: robot.id,
        detail: `Lane ${lane.id} (${lane.laneType}) at max capacity (${max})`,
      },
    };
  }

  // Prevent head-on collisions in undirected lanes (allow only if all going same way)
  if (!lane.directed && lane.currentOccupants.length > 0 && !lane.currentOccupants.includes(robot.id)) {
    const myNextWp = robot.path[robot.pathIndex + 1];
    const myCurrentWp = robot.path[robot.pathIndex];
    
    for (const occId of lane.currentOccupants) {
      const occupant = robots.find(r => r.id === occId);
      if (occupant) {
        const occCurrentWp = occupant.path[occupant.pathIndex];
        const occNextWp = occupant.path[occupant.pathIndex + 1];
        if (occCurrentWp === myNextWp && occNextWp === myCurrentWp) {
          return {
            allowed: false,
            event: {
              tick,
              type: 'reservation_denied',
              robotId: robot.id,
              detail: `Lane ${lane.id} has oncoming traffic (${occupant.name})`,
            },
          };
        }
      }
    }
  }

  // Check reservation
  if (lane.requiresReservation) {
    return requestReservation(robot, lane, tick);
  }

  return { allowed: true };
}
