// ─────────────────────────────────────────────
// FILE: src/components/analytics/StatusChart.jsx
// PURPOSE: Stacked bar chart showing total robots in each status state over time
// ─────────────────────────────────────────────
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function StatusChart({ history }) {
  if (history.length === 0) return null;

  // Sample data to avoid too many bars (1 per 50 ticks)
  const sampledData = history.filter(h => h.tick % 50 === 0);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-[250px] flex flex-col">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Fleet Status Breakdown</h3>
      <div className="flex-1 min-h-0 text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sampledData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey="tick" stroke="#6B7280" fontSize={10} tickFormatter={t => `${t}t`} />
            <YAxis stroke="#6B7280" fontSize={10} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }}
              labelFormatter={l => `Tick ${l}`}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            <Bar dataKey="statusBreakdown.moving" name="Moving" stackId="a" fill="#34D399" isAnimationActive={false} />
            <Bar dataKey="statusBreakdown.waiting" name="Waiting" stackId="a" fill="#FBBF24" isAnimationActive={false} />
            <Bar dataKey="statusBreakdown.stopped" name="Stopped" stackId="a" fill="#F87171" isAnimationActive={false} />
            <Bar dataKey="statusBreakdown.emergency" name="Emergency" stackId="a" fill="#991B1B" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
