// ─────────────────────────────────────────────
// FILE: src/components/analytics/CongestionChart.jsx
// PURPOSE: Line chart tracking congestion scores of the top 5 most congested lanes
// ─────────────────────────────────────────────
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CongestionChart({ history }) {
  if (history.length === 0) return null;

  const currentLanes = history[history.length - 1].laneCongestion;
  const topLanes = Object.entries(currentLanes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);

  const colors = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6'];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-[250px] flex flex-col">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Top 5 Congested Lanes</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey="tick" stroke="#6B7280" fontSize={10} tickFormatter={t => `${t}t`} />
            <YAxis stroke="#6B7280" fontSize={10} domain={[0, 1]} tickFormatter={v => `${v * 100}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }}
              labelFormatter={l => `Tick ${l}`}
              formatter={(value) => [`${Math.round(value * 100)}%`, 'Congestion']}
            />
            {topLanes.map((laneId, i) => (
              <Line
                key={laneId}
                type="monotone"
                dataKey={`laneCongestion.${laneId}`}
                name={laneId}
                stroke={colors[i]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
