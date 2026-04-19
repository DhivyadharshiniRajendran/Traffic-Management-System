// ─────────────────────────────────────────────
// FILE: src/engine/pathfinder.js
// PURPOSE: A* pathfinding on the lane graph with congestion and safety penalties
// ─────────────────────────────────────────────

function heuristic(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy) / 200; // normalize to rough travel time
}

function getSafetyPenalty(level) {
  switch (level) {
    case 'critical': return 8;
    case 'high': return 3;
    case 'medium': return 1;
    case 'low': return 0;
    default: return 0;
  }
}

function getTraversableLanes(waypointId, lanes) {
  const result = [];
  for (const lane of lanes) {
    if (lane.directed) {
      if (lane.from === waypointId) {
        result.push({ lane, neighborId: lane.to });
      }
    } else {
      if (lane.from === waypointId) {
        result.push({ lane, neighborId: lane.to });
      } else if (lane.to === waypointId) {
        result.push({ lane, neighborId: lane.from });
      }
    }
  }
  return result;
}

export function findPath(startId, goalId, waypoints, lanes, extraCongestion) {
  if (startId === goalId) return [startId];

  const wpMap = new Map();
  for (const wp of waypoints) wpMap.set(wp.id, wp);

  const goal = wpMap.get(goalId);
  if (!goal) return [];

  const openSet = new Map();
  const closedSet = new Set();

  const startWp = wpMap.get(startId);
  if (!startWp) return [];

  const startNode = {
    waypointId: startId,
    g: 0,
    h: heuristic(startWp, goal),
    f: heuristic(startWp, goal),
    parent: null,
  };
  openSet.set(startId, startNode);

  const allNodes = new Map();
  allNodes.set(startId, startNode);

  while (openSet.size > 0) {
    // Find node with lowest f
    let current = null;
    for (const node of openSet.values()) {
      if (!current || node.f < current.f) {
        current = node;
      }
    }
    if (!current) break;

    if (current.waypointId === goalId) {
      // Reconstruct path
      const path = [];
      let node = current;
      while (node) {
        path.unshift(node.waypointId);
        node = node.parent ? allNodes.get(node.parent) : undefined;
      }
      return path;
    }

    openSet.delete(current.waypointId);
    closedSet.add(current.waypointId);

    const neighbors = getTraversableLanes(current.waypointId, lanes);
    for (const { lane, neighborId } of neighbors) {
      if (closedSet.has(neighborId)) continue;

      const neighborWp = wpMap.get(neighborId);
      if (!neighborWp) continue;

      // Edge weight = travel_time + congestion_penalty + safety_penalty
      const distance = Math.sqrt(
        (neighborWp.x - wpMap.get(current.waypointId).x) ** 2 +
        (neighborWp.y - wpMap.get(current.waypointId).y) ** 2
      );
      const travelTime = distance / (lane.maxSpeed * 60);

      const extraCong = extraCongestion?.get(lane.id) ?? 0;
      const congestionPenalty = (lane.congestionScore + extraCong) * 10;
      const safetyPenalty = getSafetyPenalty(lane.safetyLevel);

      const edgeWeight = travelTime + congestionPenalty + safetyPenalty;
      const tentativeG = current.g + edgeWeight;

      const existing = allNodes.get(neighborId);
      if (existing && tentativeG >= existing.g) continue;

      const h = heuristic(neighborWp, goal);
      const node = {
        waypointId: neighborId,
        g: tentativeG,
        h,
        f: tentativeG + h,
        parent: current.waypointId,
      };

      allNodes.set(neighborId, node);
      openSet.set(neighborId, node);
    }
  }

  return []; // no path found
}

export function getLaneByEndpoints(fromId, toId, lanes) {
  return lanes.find(l => {
    if (l.directed) return l.from === fromId && l.to === toId;
    return (l.from === fromId && l.to === toId) || (l.to === fromId && l.from === toId);
  });
}
