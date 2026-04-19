// ─────────────────────────────────────────────
// FILE: src/engine/deadlockDetector.js
// PURPOSE: Detect deadlocks via wait-for graph cycle detection and resolve them
// ─────────────────────────────────────────────

function buildWaitForGraph(robots, lanes) {
  const edges = [];

  for (const robot of robots) {
    // Include 'waiting' robots AND 'moving' robots that are stalled (livelock)
    const isWaiting = robot.status === 'waiting';
    const isStalled = robot.status === 'moving' && robot.speed === 0 && (robot.stallTicks || 0) > 10;
    if (!isWaiting && !isStalled) continue;

    // Find what lane this robot wants to enter
    if (robot.path.length <= robot.pathIndex + 1) continue;

    const nextWpId = robot.path[robot.pathIndex + 1];
    const currentWpId = robot.path[robot.pathIndex];

    // Find the lane between current and next waypoint
    const targetLane = lanes.find(l => {
      if (l.directed) return l.from === currentWpId && l.to === nextWpId;
      return (l.from === currentWpId && l.to === nextWpId) ||
             (l.to === currentWpId && l.from === nextWpId);
    });

    if (!targetLane) continue;

    // Find who is blocking
    for (const occupantId of targetLane.currentOccupants) {
      if (occupantId !== robot.id) {
        edges.push({
          waitingRobotId: robot.id,
          blockedByRobotId: occupantId,
          laneId: targetLane.id,
        });
      }
    }
  }

  return edges;
}

function detectCycles(edges) {
  // Build adjacency list
  const adj = new Map();
  for (const edge of edges) {
    const list = adj.get(edge.waitingRobotId) || [];
    list.push(edge.blockedByRobotId);
    adj.set(edge.waitingRobotId, list);
  }

  const visited = new Set();
  const inStack = new Set();
  const cycles = [];

  function dfs(node, path) {
    if (inStack.has(node)) {
      const cycleStart = path.indexOf(node);
      if (cycleStart >= 0) {
        cycles.push(path.slice(cycleStart));
      }
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    inStack.add(node);
    path.push(node);

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      dfs(neighbor, [...path]);
    }

    inStack.delete(node);
  }

  for (const node of adj.keys()) {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  }

  return cycles;
}

export function detectAndResolveDeadlocks(robots, lanes, tick) {
  const events = [];
  const edges = buildWaitForGraph(robots, lanes);
  const cycles = detectCycles(edges);

  if (cycles.length === 0) return events;

  // Deduplicate cycles by sorting and comparing
  const processedCycles = new Set();

  for (const cycle of cycles) {
    const key = [...cycle].sort().join(',');
    if (processedCycles.has(key)) continue;
    processedCycles.add(key);

    events.push({
      tick,
      type: 'deadlock_detected',
      robotId: cycle.join(', '),
      detail: `Deadlock cycle detected: ${cycle.join(' → ')}`,
    });

    // Find robot with lowest priority (lowest totalDelay = backs up)
    let lowestPriorityRobot = null;
    for (const robotId of cycle) {
      const robot = robots.find(r => r.id === robotId);
      if (!robot) continue;
      if (!lowestPriorityRobot || robot.metrics.totalDelay < lowestPriorityRobot.metrics.totalDelay) {
        lowestPriorityRobot = robot;
      }
    }

    if (lowestPriorityRobot) {
      // Back up robot: go to previous waypoint and force replan
      if (lowestPriorityRobot.pathIndex > 0) {
        lowestPriorityRobot.pathIndex = Math.max(0, lowestPriorityRobot.pathIndex - 1);
        const prevWp = lowestPriorityRobot.path[lowestPriorityRobot.pathIndex];
        if (prevWp) {
          lowestPriorityRobot.currentWaypointId = prevWp;
        }
      }

      lowestPriorityRobot.status = 'stopped';
      lowestPriorityRobot.speed = 0;
      lowestPriorityRobot.path = []; // force replan
      lowestPriorityRobot.progress = 0;
      lowestPriorityRobot.metrics.deadlocksResolved++;

      events.push({
        tick,
        type: 'deadlock_resolved',
        robotId: lowestPriorityRobot.id,
        detail: `${lowestPriorityRobot.name} backed up to resolve deadlock`,
      });
    }
  }

  return events;
}
