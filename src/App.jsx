// ─────────────────────────────────────────────
// FILE: src/App.jsx
// PURPOSE: Main application route setup and layout
// ─────────────────────────────────────────────
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar.jsx';
import TopNav from './components/TopNav.jsx';
import LiveMap from './components/map/LiveMap.jsx';
import Analytics from './components/analytics/Analytics.jsx';
import EventLog from './components/eventlog/EventLog.jsx';
import RobotDetailPanel from './components/RobotDetailPanel.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen w-full bg-black text-gray-100 overflow-hidden font-sans selection:bg-indigo-500/30">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0 relative">
          <TopNav />
          
          <main className="flex-1 relative overflow-hidden bg-[#0A0A0A]">
            <div className="absolute inset-0 p-4">
              <Routes>
                <Route path="/" element={<LiveMap />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/eventlog" element={<EventLog />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>

        <RobotDetailPanel />
      </div>
    </BrowserRouter>
  );
}
