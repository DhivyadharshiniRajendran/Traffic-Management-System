// ─────────────────────────────────────────────
// FILE: src/engine/simulationEngine.js
// PURPOSE: Main tick loop orchestrating all simulation subsystems
// ─────────────────────────────────────────────
import { findPath, getLaneByEndpoints } from './pathfinder.js';
import { computeSpeed, shouldEmergencyStop, canRecoverFromEmergency } from './speedController.js';
import { canEnterLane, releaseReservation, resetReservations } from './reservationManager.js';
import { detectAndResolveDeadlocks } from './deadlockDetector.js';
import { updateUsageCounts, recomputeCongestion, computeHeatmap } from './heatmapEngine.js';
import { replanPath } from './replanner.js';

const MOVE_SCALE = 0.15; // pixels per speed unit per tick

function distanceBetween(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function assignNewGoal(robot, waypoints) {
  const available = waypoints.filter(w => w.id !== robot.currentWaypointId);
  // Deterministic but varied: use robot metrics to pick
  const idx = ((robot.metrics.totalThroughput_internal || 0) + robot.id.charCodeAt(2)) % available.length;
  robot.goalWaypointId = available[idx].id;
}

export function initializeRobots(robots, waypoints, lanes) {
  for (const robot of robots) {
    // Add internal throughput counter
    robot.metrics.totalThroughput_internal = 0;

    const path = findPath(
      robot.currentWaypointId || waypoints[0].id,
      robot.goalWaypointId,
      waypoints,
      lanes
    );
    robot.path = path;
    robot.pathIndex = 0;
    robot.progress = 0;
    robot.status = path.length > 1 ? 'moving' : 'idle';
  }
}

export function executeTick(tick, robots, lanes, waypoints) {
  const events = [];
  const wpMap = new Map();
  for (const wp of waypoints) wpMap.set(wp.id, wp);

  // ── Step 1: Update robot speeds ──
  for (const robot of robots) {
    if (robot.status === 'idle' || robot.status === 'stopped') continue;

    // Emergency recovery check
    if (robot.status === 'emergency') {
      robot.emergencyTicksRemaining--;
      if (robot.emergencyTicksRemaining <= 0) {
        const currentLane = robot.currentLaneId ? lanes.find(l => l.id === robot.currentLaneId) || null : null;
        if (canRecoverFromEmergency(robot, currentLane)) {
          robot.status = 'moving';
          robot.emergencyTicksRemaining = 0;
        } else {
          robot.emergencyTicksRemaining = 10; // extend
        }
      }
      continue;
    }

    const currentLane = robot.currentLaneId ? lanes.find(l => l.id === robot.currentLaneId) || null : null;

    // Check emergency stop
    if (shouldEmergencyStop(robot, currentLane)) {
      robot.status = 'emergency';
      robot.speed = 0;
      robot.emergencyTicksRemaining = 20;
      events.push({
        tick,
        type: 'emergency_stop',
        robotId: robot.id,
        detail: `${robot.name} emergency stop in ${currentLane?.laneType} zone`,
      });
      continue;
    }

    const { speed, followingRobotId } = computeSpeed(robot, currentLane, robots);
    robot.speed = speed;
    robot.followingRobotId = followingRobotId;

    if (robot.status === 'moving' && speed === 0) {
      robot.status = 'waiting';
    } else if (robot.status === 'waiting' && speed > 0 && currentLane) {
      robot.status = 'moving';
    }
  }

  // ── Step 2: Check reservation requests (BEFORE movement) ──
  for (const robot of robots) {
    if (robot.status === 'emergency' || robot.status === 'idle') continue;
    if (robot.pathIndex >= robot.path.length - 1) continue;

    const currentWpId = robot.path[robot.pathIndex];
    const nextWpId = robot.path[robot.pathIndex + 1];

    // Find lane for this segment
    const lane = getLaneByEndpoints(currentWpId, nextWpId, lanes);
    if (!lane) continue;

    // Already on this lane
    if (robot.currentLaneId === lane.id) continue;

    // Try to enter the lane
    const { allowed, event } = canEnterLane(robot, lane, tick, robots);
    if (event) events.push(event);

    if (allowed) {
      robot.currentLaneId = lane.id;
      if (!lane.currentOccupants.includes(robot.id)) {
        lane.currentOccupants.push(robot.id);
      }
      robot.status = 'moving';
      robot.denialCount = 0;
    } else {
      robot.status = 'waiting';
      robot.speed = 0;
      robot.metrics.totalDelay++;
      robot.denialCount++;

      // After 3 denials, trigger replan
      if (robot.denialCount >= 3) {
        const blockedLanes = [lane.id];
        const replanEvent = replanPath(robot, waypoints, lanes, blockedLanes, tick);
        if (replanEvent) events.push(replanEvent);
      }
    }
  }

  // ── Step 3: Move robots along paths ──
  for (const robot of robots) {
    if (robot.status !== 'moving' || robot.path.length < 2) continue;
    if (robot.pathIndex >= robot.path.length - 1) continue;

    // Don't move if we haven't secured a lane reservation yet
    if (!robot.currentLaneId) continue;

    const currentWpId = robot.path[robot.pathIndex];
    const nextWpId = robot.path[robot.pathIndex + 1];
    const currentWp = wpMap.get(currentWpId);
    const nextWp = wpMap.get(nextWpId);
    if (!currentWp || !nextWp) continue;

    const segmentDist = distanceBetween(currentWp, nextWp);
    if (segmentDist === 0) {
      robot.pathIndex++;
      robot.progress = 0;
      continue;
    }

    const moveAmount = robot.speed * MOVE_SCALE;
    robot.progress += moveAmount / segmentDist;

    // Interpolate position
    const t = Math.min(1, robot.progress);
    robot.position.x = currentWp.x + (nextWp.x - currentWp.x) * t;
    robot.position.y = currentWp.y + (nextWp.y - currentWp.y) * t;
    robot.metrics.distanceTravelled += moveAmount;

    // Reached next waypoint
    if (robot.progress >= 1) {
      // Release old lane reservation
      if (robot.currentLaneId) {
        releaseReservation(robot, robot.currentLaneId);
        const oldLane = lanes.find(l => l.id === robot.currentLaneId);
        if (oldLane) {
          oldLane.currentOccupants = oldLane.currentOccupants.filter(id => id !== robot.id);
        }
      }

      robot.pathIndex++;
      robot.progress = 0;
      robot.currentWaypointId = nextWpId;
      robot.position.x = nextWp.x;
      robot.position.y = nextWp.y;
      robot.currentLaneId = null;
    }
  }

  // ── Step 4: Stall detection (livelock breaker) ──
  for (const robot of robots) {
    if (robot.status === 'moving' && robot.speed === 0) {
      robot.stallTicks = (robot.stallTicks || 0) + 1;

      // After 30 stall ticks, force replan with heavy congestion penalty
      if (robot.stallTicks === 30) {
        const currentLaneIds = robot.currentLaneId ? [robot.currentLaneId] : [];
        const replanEvent = replanPath(robot, waypoints, lanes, currentLaneIds, tick);
        if (replanEvent) events.push(replanEvent);
      }

      // After 60 stall ticks, force a new goal entirely (if not completed 12 throughputs)
      if (robot.stallTicks >= 60 && (robot.metrics.totalThroughput_internal || 0) < 12) {
        assignNewGoal(robot, waypoints);
        const newPath = findPath(robot.currentWaypointId, robot.goalWaypointId, waypoints, lanes);
        robot.path = newPath;
        robot.pathIndex = 0;
        robot.progress = 0;
        robot.stallTicks = 0;
        robot.status = newPath.length > 1 ? 'moving' : 'idle';
        events.push({
          tick,
          type: 'stall_resolved',
          robotId: robot.id,
          detail: `${robot.name} reassigned goal after prolonged stall`,
        });
      }
    } else if (robot.status === 'moving' && robot.speed > robot.baseSpeed * 0.2 && robot.progress > 0) {
      robot.stallTicks = 0; // reset only when actually moving normally
    }
  }

  // ── Step 5: Update lane occupancy ──
  for (const lane of lanes) {
    lane.currentOccupants = lane.currentOccupants.filter(robotId =>
      robots.some(r => r.id === robotId && r.currentLaneId === lane.id)
    );
  }

  // ── Step 6: Update heatmap ──
  updateUsageCounts(lanes);
  if (tick % 5 === 0) {
    recomputeCongestion(lanes);
  }
  const heatmap = computeHeatmap(lanes);

  // ── Step 7: Deadlock detection every 10 ticks ──
  if (tick % 10 === 0) {
    const deadlockEvents = detectAndResolveDeadlocks(robots, lanes, tick);
    events.push(...deadlockEvents);
  }

  // ── Step 8: Goal completion + new goal + replan ──
  for (const robot of robots) {
    if (robot.currentWaypointId === robot.goalWaypointId && robot.path.length > 0) {
      robot.metrics.totalThroughput_internal = (robot.metrics.totalThroughput_internal || 0) + 1;

      if (robot.metrics.totalThroughput_internal >= 12 || robot.emergencyStopRequested) {
        robot.path = [];
        robot.status = 'idle';
        robot.stallTicks = 0;
        events.push({
          tick,
          type: robot.emergencyStopRequested ? 'emergency_stop' : 'goal_reached',
          robotId: robot.id,
          detail: robot.emergencyStopRequested
            ? `${robot.name} successfully reached waypoint and executed ordered E-Stop.`
            : `${robot.name} destination reached. 12 throughputs completed. Standing by.`,
        });
      } else {
        events.push({
          tick,
          type: 'goal_reached',
          robotId: robot.id,
          detail: `${robot.name} reached goal ${robot.goalWaypointId}`,
        });

        assignNewGoal(robot, waypoints);
        const newPath = findPath(robot.currentWaypointId, robot.goalWaypointId, waypoints, lanes);
        robot.path = newPath;
        robot.pathIndex = 0;
        robot.progress = 0;
        robot.stallTicks = 0;
        robot.status = newPath.length > 1 ? 'moving' : 'idle';
      }
    }

    // Replan if path is empty and not at goal and hasn't finished 12 tasks or E-Stopped
    if (robot.path.length === 0 && robot.status !== 'emergency' && !robot.emergencyStopRequested && (robot.metrics.totalThroughput_internal || 0) < 12) {
      const startWp = robot.currentWaypointId || waypoints[0].id;
      const newPath = findPath(startWp, robot.goalWaypointId, waypoints, lanes);
      if (newPath.length > 1) {
        robot.path = newPath;
        robot.pathIndex = 0;
        robot.progress = 0;
        robot.status = 'moving';
      }
    }

    // Increment delay for waiting/stopped robots
    if (robot.status === 'waiting' || robot.status === 'stopped') {
      robot.metrics.totalDelay++;
    }
  }

  // ── Step 9: Metrics snapshot ──
  let snapshot = null;
  if (tick % 10 === 0) {
    const statusBreakdown = { moving: 0, waiting: 0, stopped: 0, emergency: 0, idle: 0 };
    let totalDelay = 0;
    let throughputCount = 0;

    for (const robot of robots) {
      statusBreakdown[robot.status]++;
      totalDelay += robot.metrics.totalDelay;
      throughputCount += robot.metrics.totalThroughput_internal || 0;
    }

    const laneCongestion = {};
    for (const lane of lanes) {
      laneCongestion[lane.id] = lane.congestionScore;
    }

    snapshot = {
      tick,
      throughput: throughputCount,
      avgDelay: totalDelay / robots.length,
      deadlockCount: events.filter(e => e.type === 'deadlock_detected').length,
      activeRobots: robots.filter(r => r.status === 'moving').length,
      statusBreakdown,
      laneCongestion,
    };
  }

  return { events, heatmap, snapshot };
}

export { resetReservations };
