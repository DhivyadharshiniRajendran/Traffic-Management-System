// ─────────────────────────────────────────────
// FILE: src/data/warehouseMap.js
// PURPOSE: Hardcoded warehouse layout with 20 waypoints (5x4 grid) and 35 lanes
// ─────────────────────────────────────────────

const GRID_OFFSET_X = 120;
const GRID_OFFSET_Y = 80;
const GRID_SPACING_X = 200;
const GRID_SPACING_Y = 160;

function wp(col, row) {
  return {
    x: GRID_OFFSET_X + col * GRID_SPACING_X,
    y: GRID_OFFSET_Y + row * GRID_SPACING_Y,
  };
}

export const waypoints = [
  { id: 'A1', label: 'A1', ...wp(0, 0) },
  { id: 'B1', label: 'B1', ...wp(1, 0) },
  { id: 'C1', label: 'C1', ...wp(2, 0) },
  { id: 'D1', label: 'D1', ...wp(3, 0) },
  { id: 'E1', label: 'E1', ...wp(4, 0) },

  { id: 'A2', label: 'A2', ...wp(0, 1) },
  { id: 'B2', label: 'B2', ...wp(1, 1) },
  { id: 'C2', label: 'C2', ...wp(2, 1) },
  { id: 'D2', label: 'D2', ...wp(3, 1) },
  { id: 'E2', label: 'E2', ...wp(4, 1) },

  { id: 'A3', label: 'A3', ...wp(0, 2) },
  { id: 'B3', label: 'B3', ...wp(1, 2) },
  { id: 'C3', label: 'C3', ...wp(2, 2) },
  { id: 'D3', label: 'D3', ...wp(3, 2) },
  { id: 'E3', label: 'E3', ...wp(4, 2) },

  { id: 'A4', label: 'A4', ...wp(0, 3) },
  { id: 'B4', label: 'B4', ...wp(1, 3) },
  { id: 'C4', label: 'C4', ...wp(2, 3) },
  { id: 'D4', label: 'D4', ...wp(3, 3) },
  { id: 'E4', label: 'E4', ...wp(4, 3) },
];

let laneCounter = 0;
function makeLane(from, to, opts = {}) {
  laneCounter++;
  return {
    id: `L${String(laneCounter).padStart(2, '0')}`,
    from,
    to,
    directed: opts.directed ?? false,
    maxSpeed: opts.maxSpeed ?? 2.0,
    safetyLevel: opts.safetyLevel ?? 'low',
    laneType: opts.laneType ?? 'normal',
    congestionScore: 0,
    usageCount: 0,
    requiresReservation: opts.requiresReservation ?? false,
    currentOccupants: [],
  };
}

export const lanes = [
  makeLane('A1', 'B1', { directed: false, maxSpeed: 2.5 }),
  makeLane('B1', 'C1', { directed: false, maxSpeed: 2.5 }),
  makeLane('C1', 'D1', { directed: false, maxSpeed: 2.0 }),
  makeLane('D1', 'E1', { directed: true, maxSpeed: 2.0 }),

  makeLane('A2', 'B2', { directed: false, maxSpeed: 2.0 }),
  makeLane('B2', 'C2', { directed: false, maxSpeed: 1.0, laneType: 'narrow', safetyLevel: 'medium' }),
  makeLane('C2', 'D2', { directed: false, maxSpeed: 2.0, laneType: 'intersection', safetyLevel: 'high', requiresReservation: true }),
  makeLane('D2', 'E2', { directed: false, maxSpeed: 2.0 }),

  makeLane('A3', 'B3', { directed: false, maxSpeed: 2.0 }),
  makeLane('B3', 'C3', { directed: false, maxSpeed: 0.5, laneType: 'human_zone', safetyLevel: 'critical', requiresReservation: true }),
  makeLane('C3', 'D3', { directed: false, maxSpeed: 2.0, laneType: 'intersection', safetyLevel: 'high', requiresReservation: true }),
  makeLane('D3', 'E3', { directed: true, maxSpeed: 1.0, laneType: 'narrow', safetyLevel: 'medium' }),

  makeLane('A4', 'B4', { directed: false, maxSpeed: 2.0 }),
  makeLane('B4', 'C4', { directed: false, maxSpeed: 2.0 }),
  makeLane('C4', 'D4', { directed: false, maxSpeed: 2.5 }),
  makeLane('D4', 'E4', { directed: false, maxSpeed: 2.0 }),

  makeLane('A1', 'A2', { directed: false, maxSpeed: 2.0 }),
  makeLane('A2', 'A3', { directed: false, maxSpeed: 2.0 }),
  makeLane('A3', 'A4', { directed: false, maxSpeed: 2.0 }),

  makeLane('B1', 'B2', { directed: false, maxSpeed: 2.0 }),
  makeLane('B2', 'B3', { directed: false, maxSpeed: 2.0, laneType: 'intersection', safetyLevel: 'high', requiresReservation: true }),
  makeLane('B3', 'B4', { directed: false, maxSpeed: 2.0 }),

  makeLane('C1', 'C2', { directed: false, maxSpeed: 1.0, laneType: 'narrow', safetyLevel: 'medium' }),
  makeLane('C2', 'C3', { directed: false, maxSpeed: 2.0 }),
  makeLane('C3', 'C4', { directed: false, maxSpeed: 2.0 }),

  makeLane('D1', 'D2', { directed: false, maxSpeed: 2.0 }),
  makeLane('D2', 'D3', { directed: false, maxSpeed: 0.5, laneType: 'human_zone', safetyLevel: 'critical', requiresReservation: true }),
  makeLane('D3', 'D4', { directed: false, maxSpeed: 2.0 }),

  makeLane('E1', 'E2', { directed: true, maxSpeed: 2.0 }),
  makeLane('E2', 'E3', { directed: false, maxSpeed: 2.0 }),
  makeLane('E3', 'E4', { directed: true, maxSpeed: 2.0 }),

  makeLane('B2', 'C3', { directed: false, maxSpeed: 1.5, safetyLevel: 'medium' }),
  makeLane('C2', 'B3', { directed: false, maxSpeed: 1.5, safetyLevel: 'medium' }),
  makeLane('D2', 'C3', { directed: false, maxSpeed: 1.5, safetyLevel: 'medium' }),
  makeLane('C2', 'D3', { directed: false, maxSpeed: 1.5, safetyLevel: 'medium' }),
];
