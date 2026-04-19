// ─────────────────────────────────────────────
// FILE: src/components/analytics/ThroughputChart.jsx
// PURPOSE: Area chart tracking total goals reached per 50-tick window
// ─────────────────────────────────────────────
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ThroughputChart({ history }) {
  // Aggregate into 50-tick windows
  const windows = [];
  let currentWindow = null;

  for (let i = 0; i < history.length; i++) {
    const snap = history[i];
    const windowIdx = Math.floor(snap.tick / 50) * 50;
    
    if (!currentWindow || currentWindow.tick !== windowIdx) {
      if (currentWindow) windows.push(currentWindow);
      currentWindow = { tick: windowIdx, throughput: snap.throughput };
    } else {
      currentWindow.throughput = Math.max(currentWindow.throughput, snap.throughput);
    }
  }
  if (currentWindow) windows.push(currentWindow);

  // Calculate delta per window
  const plotData = [];
  for (let i = 1; i < windows.length; i++) {
    plotData.push({
      tick: windows[i].tick,
      goals: windows[i].throughput - windows[i-1].throughput,
    });
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-[250px] flex flex-col">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Throughput (Goals / 50 ticks)</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={plotData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey="tick" stroke="#6B7280" fontSize={10} tickFormatter={t => `${t}t`} />
            <YAxis stroke="#6B7280" fontSize={10} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }}
              labelFormatter={l => `Window: Tick ${l - 50}-${l}`}
              formatter={(value) => [value, 'Goals Reached']}
            />
            <Area type="monotone" dataKey="goals" stroke="#10B981" fillOpacity={1} fill="url(#colorGoals)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
