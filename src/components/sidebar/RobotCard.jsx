// ─────────────────────────────────────────────
// FILE: src/components/sidebar/RobotCard.jsx
// PURPOSE: Individual robot card in the sidebar fleet list
// ─────────────────────────────────────────────
function getStatusBadge(status) {
  switch (status) {
    case 'moving':
      return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Moving', dot: 'bg-emerald-400' };
    case 'waiting':
      return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Waiting', dot: 'bg-amber-400' };
    case 'stopped':
      return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Stopped', dot: 'bg-red-400' };
    case 'emergency':
      return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Emergency', dot: 'bg-red-400 animate-pulse' };
    case 'idle':
      return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Idle', dot: 'bg-gray-400' };
    default:
      return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Unknown', dot: 'bg-gray-400' };
  }
}

export default function RobotCard({ robot, isSelected, onSelect }) {
  const badge = getStatusBadge(robot.status);

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-2.5 rounded-lg transition-all duration-200 border ${
        isSelected
          ? 'bg-indigo-500/10 border-indigo-500/30 shadow-lg shadow-indigo-500/5'
          : 'bg-gray-800/30 border-gray-800/50 hover:bg-gray-800/60 hover:border-gray-700/50'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-3 h-3 rounded-full shrink-0 shadow-lg"
          style={{ backgroundColor: robot.color, boxShadow: `0 0 8px ${robot.color}40` }}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-200 truncate">{robot.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${badge.bg} ${badge.text} border ${badge.border} flex items-center gap-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
              {badge.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-gray-500">{robot.speed.toFixed(1)} m/s</span>
            <span className="text-[10px] text-gray-600">•</span>
            <span className="text-[10px] text-gray-500">{robot.personality}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
