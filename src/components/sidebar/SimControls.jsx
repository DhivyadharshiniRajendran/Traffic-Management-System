// ─────────────────────────────────────────────
// FILE: src/components/sidebar/SimControls.jsx
// PURPOSE: Play/Pause/Reset buttons and speed multiplier toggle
// ─────────────────────────────────────────────
import { useSimulationStore } from '../../store/simulationStore.js';

const speeds = [1, 2, 3, 5];

export default function SimControls() {
  const { running, speed, tick, start, pause, reset, setSpeed } = useSimulationStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Simulation</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          running
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : tick > 0
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'bg-gray-700/50 text-gray-400 border border-gray-600/30'
        }`}>
          {running ? 'Running' : tick > 0 ? 'Paused' : 'Ready'}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={running ? pause : start}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            running
              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
          }`}
        >
          {running ? (
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><rect x="5" y="4" width="3" height="12" rx="1" /><rect x="12" y="4" width="3" height="12" rx="1" /></svg>
              Pause
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
              Play
            </span>
          )}
        </button>
        <button
          onClick={reset}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/30 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1.5 block">Speed</label>
        <div className="flex rounded-lg overflow-hidden border border-gray-700/50">
          {speeds.map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`flex-1 py-1.5 text-xs font-semibold transition-all duration-200 ${
                speed === s
                  ? 'bg-indigo-500/30 text-indigo-300 border-indigo-500/30'
                  : 'bg-gray-800/50 text-gray-500 hover:bg-gray-700/50 hover:text-gray-300'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-lg p-2.5 border border-gray-800/50">
        <span className="text-xs text-gray-500">Tick</span>
        <p className="text-lg font-mono font-bold text-gray-200 tracking-wider">
          {String(tick).padStart(5, '0')}
        </p>
      </div>
    </div>
  );
}
