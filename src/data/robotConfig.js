// ─────────────────────────────────────────────
// FILE: src/data/robotConfig.js
// PURPOSE: Initial configuration for 10 robots with distinct personalities
// ─────────────────────────────────────────────
import { waypoints } from './warehouseMap.js';

const templates = [
  { name: 'Blitz', color: '#EF4444', personality: 'aggressive', baseSpeed: 2.8, safeFollowingDistance: 20 },
  { name: 'Surge', color: '#F97316', personality: 'aggressive', baseSpeed: 2.6, safeFollowingDistance: 22 },
  { name: 'Atlas', color: '#3B82F6', personality: 'standard', baseSpeed: 2.0, safeFollowingDistance: 35 },
  { name: 'Nova', color: '#8B5CF6', personality: 'standard', baseSpeed: 2.0, safeFollowingDistance: 35 },
  { name: 'Pulse', color: '#06B6D4', personality: 'standard', baseSpeed: 1.8, safeFollowingDistance: 35 },
  { name: 'Vega', color: '#10B981', personality: 'standard', baseSpeed: 2.0, safeFollowingDistance: 35 },
  { name: 'Sage', color: '#84CC16', personality: 'cautious', baseSpeed: 1.2, safeFollowingDistance: 50 },
  { name: 'Drift', color: '#A855F7', personality: 'cautious', baseSpeed: 1.0, safeFollowingDistance: 55 },
  { name: 'Aegis', color: '#F43F5E', personality: 'emergency', baseSpeed: 2.0, safeFollowingDistance: 30 },
  { name: 'Sentry', color: '#FBBF24', personality: 'emergency', baseSpeed: 1.8, safeFollowingDistance: 30 },
];

const startWaypoints = ['A1', 'E1', 'A4', 'E4', 'C2', 'B3', 'D1', 'A2', 'E3', 'C4'];
const goalWaypoints = ['E4', 'A4', 'E1', 'A1', 'D3', 'C1', 'B4', 'E2', 'A3', 'B1'];

export function createInitialRobots() {
  return templates.map((t, i) => {
    const startWp = waypoints.find(w => w.id === startWaypoints[i]);
    return {
      id: `R${String(i + 1).padStart(2, '0')}`,
      name: t.name,
      color: t.color,
      position: { x: startWp.x, y: startWp.y },
      currentLaneId: null,
      currentWaypointId: startWaypoints[i],
      goalWaypointId: goalWaypoints[i],
      path: [],
      speed: 0,
      status: 'idle',
      reservedLaneIds: [],
      followingRobotId: null,
      safeFollowingDistance: t.safeFollowingDistance,
      metrics: { totalDelay: 0, distanceTravelled: 0, deadlocksResolved: 0 },
      personality: t.personality,
      baseSpeed: t.baseSpeed,
      denialCount: 0,
      stallTicks: 0,
      emergencyTicksRemaining: 0,
      pathIndex: 0,
      progress: 0,
    };
  });
}
