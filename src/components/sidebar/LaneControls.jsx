// ─────────────────────────────────────────────
// FILE: src/components/sidebar/LaneControls.jsx
// PURPOSE: Toggle switches for heatmap, reservations, and path overlays
// ─────────────────────────────────────────────
import { useSimulationStore } from '../../store/simulationStore.js';

export default function LaneControls() {
  const { showHeatmap, showReservations, showPaths, toggleHeatmap, toggleReservations, togglePaths } = useSimulationStore();

  const toggles = [
    { label: 'Heatmap overlay', checked: showHeatmap, onChange: toggleHeatmap, color: 'bg-orange-500' },
    { label: 'Reservation status', checked: showReservations, onChange: toggleReservations, color: 'bg-purple-500' },
    { label: 'Robot paths', checked: showPaths, onChange: togglePaths, color: 'bg-cyan-500' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lane Controls</h3>
      {toggles.map(t => (
        <label key={t.label} className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{t.label}</span>
          <button
            onClick={t.onChange}
            className={`relative w-9 h-5 rounded-full transition-all duration-300 ${
              t.checked ? t.color : 'bg-gray-700'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
                t.checked ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </label>
      ))}
    </div>
  );
}
