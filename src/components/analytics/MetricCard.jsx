// ─────────────────────────────────────────────
// FILE: src/components/analytics/MetricCard.jsx
// PURPOSE: Reusable card to display a single top-level KPI
// ─────────────────────────────────────────────
export default function MetricCard({ title, value, subtitle, icon, valueColor = 'text-white' }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className="text-gray-500 bg-gray-800/50 p-1.5 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="mt-2">
        <p className={`text-2xl font-bold tracking-tight ${valueColor}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
