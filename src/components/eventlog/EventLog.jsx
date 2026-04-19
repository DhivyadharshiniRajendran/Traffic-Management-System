// ─────────────────────────────────────────────
// FILE: src/components/eventlog/EventLog.jsx
// PURPOSE: Filterable log list of simulation events
// ─────────────────────────────────────────────
import { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore.js';
import EventRow from './EventRow.jsx';

const eventTypes = [
  'deadlock_detected', 'deadlock_resolved', 'reservation_denied',
  'emergency_stop', 'rerouted', 'goal_reached'
];

export default function EventLog() {
  const { log } = useSimulationStore();
  const [filterType, setFilterType] = useState(null);
  const [filterRobot, setFilterRobot] = useState('');

  // Newest first
  const reversedLog = [...log].reverse();

  const filteredLog = reversedLog.filter(e => {
    if (filterType && e.type !== filterType) return false;
    if (filterRobot && !e.robotId.toLowerCase().includes(filterRobot.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-gray-950">
      <div className="px-6 py-4 border-b border-gray-800/60 flex items-center justify-between shrink-0">
        <h2 className="text-lg font-semibold text-gray-200">Simulation Event Log</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Filter by Robot ID..."
            value={filterRobot}
            onChange={e => setFilterRobot(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-sm text-gray-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 w-40 placeholder-gray-600"
          />
        </div>
      </div>

      <div className="px-6 py-2 border-b border-gray-800 flex items-center gap-2 overflow-x-auto scrollbar-hide shrink-0">
        <button
          onClick={() => setFilterType(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            !filterType ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All Events
        </button>
        {eventTypes.map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              filterType === t ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredLog.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            No matching events found.
          </div>
        ) : (
          filteredLog.map((event, i) => (
            <EventRow key={`${event.tick}-${i}`} event={event} />
          ))
        )}
      </div>
    </div>
  );
}
