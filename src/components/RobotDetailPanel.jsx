// ─────────────────────────────────────────────
// FILE: src/components/RobotDetailPanel.jsx
// PURPOSE: Slide-in panel showing detailed stats and context for the selected robot
// ─────────────────────────────────────────────
import { useSimulationStore } from '../store/simulationStore.js';

export default function RobotDetailPanel() {
  const { robots, selectedRobotId, selectRobot, lanes, waypoints, log, toggleEmergency } = useSimulationStore();

  if (!selectedRobotId) return null;

  const robot = robots.find(r => r.id === selectedRobotId);
  if (!robot) return null;

  const currentLane = lanes.find(l => l.id === robot.currentLaneId);
  const robotEvents = log.filter(e => e.robotId.includes(robot.id)).reverse().slice(0, 10);

  const wpMap = new Map();
  for (const wp of waypoints) wpMap.set(wp.id, wp);

  return (
    <div className="w-[320px] h-screen bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col shrink-0 transform transition-transform duration-300">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: robot.color, boxShadow: `0 0 10px ${robot.color}80` }} />
          <h2 className="text-base font-bold text-gray-100">{robot.name} ({robot.id})</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => toggleEmergency(robot.id)}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${
              robot.emergencyStopRequested 
                ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]' 
                : 'bg-gray-800 text-red-400 hover:bg-gray-700 border border-red-900/50'
            }`}
          >
            {robot.emergencyStopRequested ? 'Cancel E-Stop' : 'E-Stop'}
          </button>
          <button onClick={() => selectRobot(null)} className="text-gray-500 hover:text-gray-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
        {/* Status */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Live Status</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
              <span className="block text-[10px] text-gray-500 uppercase">State</span>
              <span className="text-sm font-medium text-gray-200 capitalize">{robot.status}</span>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
              <span className="block text-[10px] text-gray-500 uppercase">Speed</span>
              <span className="text-sm font-medium text-gray-200">{robot.speed.toFixed(1)} m/s</span>
            </div>
          </div>
        </section>

        {/* Location */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Location</h3>
          <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Lane</span>
              <span className="text-gray-300 font-mono">{currentLane?.id || 'Waypoint'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">To</span>
              <span className="text-gray-300 font-mono">{robot.goalWaypointId}</span>
            </div>
            {currentLane && (
              <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                <span className="text-gray-500">Lane Type</span>
                <span className={`capitalize ${currentLane.laneType === 'human_zone' ? 'text-red-400' : 'text-gray-300'}`}>
                  {currentLane.laneType.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Metrics */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Performance</h3>
          <div className="space-y-3 shrink-0">
            <div className="flex justify-between items-center bg-gray-800/30 px-3 py-2 rounded">
              <span className="text-sm text-gray-400">Total Delay</span>
              <span className="text-sm font-medium text-amber-400">{robot.metrics.totalDelay}s</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/30 px-3 py-2 rounded">
              <span className="text-sm text-gray-400">Deadlocks Cleared</span>
              <span className="text-sm font-medium text-red-400">{robot.metrics.deadlocksResolved}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/30 px-3 py-2 rounded">
              <span className="text-sm text-gray-400">Throughput</span>
              <span className="text-sm font-medium text-emerald-400">{robot.metrics.totalThroughput_internal} goals</span>
            </div>
          </div>
        </section>

        {/* Route visualization */}
        {robot.path.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Active Route</h3>
            <div className="flex flex-wrap gap-2">
              {robot.path.slice(robot.pathIndex).map((wp, i, arr) => (
                <div key={i} className="flex items-center">
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    i === 0 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {wp}
                  </span>
                  {i < arr.length - 1 && <span className="text-gray-600 mx-1">→</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Events */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Events</h3>
          <div className="space-y-2">
            {robotEvents.length === 0 && <p className="text-xs text-gray-600">No events found.</p>}
            {robotEvents.map((e, i) => (
              <div key={i} className="text-[11px] border-l-2 border-gray-700 pl-2 py-0.5">
                <span className="text-gray-500 font-mono mr-2">T:{e.tick}</span>
                <span className={e.type.includes('deadlock') || e.type.includes('emergency') ? 'text-red-400' : 'text-gray-300'}>
                  {e.detail}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
