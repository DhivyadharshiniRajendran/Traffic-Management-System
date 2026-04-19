// ─────────────────────────────────────────────
// FILE: src/components/eventlog/EventRow.jsx
// PURPOSE: Single typed and color-coded event row component
// ─────────────────────────────────────────────
function getEventStyle(type) {
  switch (type) {
    case 'deadlock_detected': return 'bg-red-500/10 text-red-400 border-l-2 border-red-500';
    case 'deadlock_resolved': return 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500';
    case 'reservation_denied': return 'bg-amber-500/10 text-amber-400 border-l-2 border-amber-500';
    case 'emergency_stop': return 'bg-red-500/20 text-red-500 border-l-4 border-red-500 font-medium';
    case 'rerouted': return 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-500';
    case 'goal_reached': return 'bg-gray-800/30 text-emerald-500/70 border-l-2 border-emerald-500/30';
    default: return 'bg-gray-800/30 text-gray-400 border-l-2 border-gray-600';
  }
}

function formatLabel(type) {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function EventRow({ event }) {
  return (
    <div className={`px-4 py-2 text-xs flex items-start gap-4 border-b border-gray-800/50 ${getEventStyle(event.type)}`}>
      <div className="w-16 shrink-0 font-mono text-gray-500">
        {String(event.tick).padStart(5, '0')}
      </div>
      <div className="w-32 shrink-0 font-semibold uppercase tracking-wider text-[10px]">
        {formatLabel(event.type)}
      </div>
      <div className="w-12 shrink-0 font-bold">
        {event.robotId.replace(/R0/g, 'R')}
      </div>
      <div className="flex-1 opacity-90">
        {event.detail}
      </div>
    </div>
  );
}
