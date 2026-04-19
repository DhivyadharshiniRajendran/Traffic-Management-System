// ─────────────────────────────────────────────
// FILE: src/store/simulationStore.js
// PURPOSE: Zustand global state store for the entire simulation
// ─────────────────────────────────────────────
import { create } from 'zustand';
import { waypoints, lanes as initialLanes } from '../data/warehouseMap.js';
import { createInitialRobots } from '../data/robotConfig.js';
import { executeTick, initializeRobots, resetReservations } from '../engine/simulationEngine.js';

function deepCloneLanes() {
  return initialLanes.map(l => ({
    ...l,
    currentOccupants: [],
    congestionScore: 0,
    usageCount: 0,
  }));
}

export const useSimulationStore = create((set, get) => {
  const initialRobots = createInitialRobots();
  const clonedLanes = deepCloneLanes();

  return {
    tick: 0,
    running: false,
    speed: 1,
    waypoints: [...waypoints],
    lanes: clonedLanes,
    robots: initialRobots,
    heatmap: [],
    globalMetrics: {
      totalThroughput: 0,
      avgDelay: 0,
      deadlockCount: 0,
      activeRobots: 0,
    },
    log: [],
    metricsHistory: [],
    selectedRobotId: null,
    showHeatmap: false,
    showReservations: false,
    showPaths: true,

    start: () => {
      const state = get();
      if (state.tick === 0) {
        initializeRobots(state.robots, state.waypoints, state.lanes);
      }
      set({ running: true });
    },

    pause: () => set({ running: false }),

    reset: () => {
      resetReservations();
      const freshRobots = createInitialRobots();
      const freshLanes = deepCloneLanes();
      set({
        tick: 0,
        running: false,
        robots: freshRobots,
        lanes: freshLanes,
        heatmap: [],
        globalMetrics: {
          totalThroughput: 0,
          avgDelay: 0,
          deadlockCount: 0,
          activeRobots: 0,
        },
        log: [],
        metricsHistory: [],
        selectedRobotId: null,
      });
    },

    setSpeed: (speed) => set({ speed }),

    runTick: () => {
      const state = get();
      if (!state.running) return;

      const currentTick = state.tick + 1;
      const { events, heatmap, snapshot } = executeTick(
        currentTick,
        state.robots,
        state.lanes,
        state.waypoints
      );

      const newLog = [...state.log, ...events].slice(-1000);
      const newHistory = snapshot
        ? [...state.metricsHistory, snapshot].slice(-500)
        : state.metricsHistory;

      // Compute global metrics
      let totalThroughput = 0;
      let totalDelay = 0;
      let deadlockCount = 0;
      const activeRobots = state.robots.filter(r => r.status === 'moving').length;

      for (const robot of state.robots) {
        totalThroughput += robot.metrics.totalThroughput_internal || 0;
        totalDelay += robot.metrics.totalDelay;
      }
      deadlockCount = newLog.filter(e => e.type === 'deadlock_detected').length;

      set({
        tick: currentTick,
        heatmap,
        log: newLog,
        metricsHistory: newHistory,
        globalMetrics: {
          totalThroughput,
          avgDelay: totalDelay / state.robots.length,
          deadlockCount,
          activeRobots,
        },
      });
    },

    selectRobot: (id) => set({ selectedRobotId: id }),
    toggleHeatmap: () => set(s => ({ showHeatmap: !s.showHeatmap })),
    toggleReservations: () => set(s => ({ showReservations: !s.showReservations })),
    togglePaths: () => set(s => ({ showPaths: !s.showPaths })),

    addRobot: (name, startWpId) => set((state) => {
      const wp = state.waypoints.find(w => w.id === startWpId);
      if (!wp) return {};
      
      // Select a random goal that isn't the spawn point
      const nextGoals = state.waypoints.filter(w => w.id !== wp.id);
      const randomGoal = nextGoals[Math.floor(Math.random() * nextGoals.length)];

      const newRobot = {
        id: `R${String(state.robots.length + 1).padStart(2, '0')}`,
        name: name,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        baseSpeed: 1.5,
        safeFollowingDistance: 35,
        personality: 'standard',
        position: { x: wp.x, y: wp.y },
        currentWaypointId: wp.id,
        goalWaypointId: randomGoal.id,
        currentLaneId: null,
        status: 'idle',
        speed: 0,
        path: [],
        pathIndex: 0,
        progress: 0,
        metrics: { totalDelay: 0, deadlocksResolved: 0, totalThroughput_internal: 0 },
        reservedLaneIds: [],
        denialCount: 0,
        stallTicks: 0,
      };
      
      return { robots: [...state.robots, newRobot] };
    }),

    toggleEmergency: (robotId) => set((state) => {
      return {
        robots: state.robots.map(rob => {
          if (rob.id !== robotId) return rob;
          return {
            ...rob,
            emergencyStopRequested: !rob.emergencyStopRequested
          };
        })
      };
    }),
  };
});
