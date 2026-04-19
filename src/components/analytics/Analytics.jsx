// ─────────────────────────────────────────────
// FILE: src/components/analytics/Analytics.jsx
// PURPOSE: Full analytics dashboard grid with KPIs and Recharts widgets
// ─────────────────────────────────────────────
import { useSimulationStore } from '../../store/simulationStore.js';
import MetricCard from './MetricCard.jsx';
import CongestionChart from './CongestionChart.jsx';
import DelayChart from './DelayChart.jsx';
import ThroughputChart from './ThroughputChart.jsx';
import StatusChart from './StatusChart.jsx';

export default function Analytics() {
  const { globalMetrics, robots, metricsHistory } = useSimulationStore();

  return (
    <div className="h-full overflow-y-auto p-6 scrollbar-thin space-y-6 bg-gray-950">
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Throughput"
          value={globalMetrics.totalThroughput}
          subtitle="Goals reached"
          valueColor="text-emerald-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <MetricCard
          title="Average Delay"
          value={`${globalMetrics.avgDelay.toFixed(1)}s`}
          subtitle="Total wait / total robots"
          valueColor="text-amber-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <MetricCard
          title="Deadlocks Resolved"
          value={globalMetrics.deadlockCount}
          subtitle="Requires engine intervention"
          valueColor={globalMetrics.deadlockCount > 0 ? "text-red-400" : "text-gray-200"}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
        <MetricCard
          title="Active Robots"
          value={`${globalMetrics.activeRobots} / ${robots.length}`}
          subtitle="Currently moving on routes"
          valueColor="text-indigo-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CongestionChart history={metricsHistory} />
        <DelayChart robots={robots} />
        <ThroughputChart history={metricsHistory} />
        <StatusChart history={metricsHistory} />
      </div>
    </div>
  );
}
