// ─────────────────────────────────────────────
// FILE: src/engine/replanner.js
// PURPOSE: Dynamic path replanning when robots are blocked or deadlocked
// ─────────────────────────────────────────────
import { findPath } from './pathfinder.js';
import { releaseReservation } from './reservationManager.js';

export function replanPath(robot, waypoints, lanes, blockedLaneIds, tick) {
  // Create extra congestion penalties for blocked lanes
  const extraCongestion = new Map();
  for (const laneId of blockedLaneIds) {
    extraCongestion.set(laneId, 5); // heavy penalty
  }

  const startWp = robot.currentWaypointId || (robot.path.length > 0 ? robot.path[robot.pathIndex] : null);
  if (!startWp) {
    robot.status = 'idle';
    return null;
  }

  const newPath = findPath(startWp, robot.goalWaypointId, waypoints, lanes, extraCongestion);

  if (newPath.length === 0) {
    if (robot.currentLaneId) {
      releaseReservation(robot, robot.currentLaneId);
      robot.currentLaneId = null;
    }
    robot.status = 'idle';
    return {
      tick,
      type: 'rerouted',
      robotId: robot.id,
      detail: `${robot.name}: no alternate path found to ${robot.goalWaypointId}, set to idle`,
    };
  }

  if (robot.currentLaneId) {
    releaseReservation(robot, robot.currentLaneId);
    robot.currentLaneId = null;
  }

  robot.path = newPath;
  robot.pathIndex = 0;
  robot.progress = 0;
  robot.denialCount = 0;
  robot.status = 'moving';

  return {
    tick,
    type: 'rerouted',
    robotId: robot.id,
    detail: `${robot.name} rerouted: ${newPath.join(' → ')}`,
  };
}
