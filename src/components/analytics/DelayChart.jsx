// ─────────────────────────────────────────────
// FILE: src/components/analytics/DelayChart.jsx
// PURPOSE: Horizontal bar chart showing accumulated delay per robot
// ─────────────────────────────────────────────
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DelayChart({ robots }) {
  const data = robots
    .map(r => ({
      id: r.id.replace('R0', 'R'),
      name: r.name,
      delay: r.metrics.totalDelay,
      color: r.color,
    }))
    .sort((a, b) => b.delay - a.delay);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-[250px] flex flex-col">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Total Delay per Robot</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
            <XAxis type="number" stroke="#6B7280" fontSize={10} />
            <YAxis dataKey="id" type="category" stroke="#6B7280" fontSize={10} width={30} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }}
              formatter={(value, _name, props) => [`${value}s`, props.payload.name]}
            />
            <Bar dataKey="delay" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
