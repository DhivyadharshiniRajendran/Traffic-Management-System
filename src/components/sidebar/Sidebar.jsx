// ─────────────────────────────────────────────
// FILE: src/components/sidebar/Sidebar.jsx
// PURPOSE: Fixed left sidebar containing logo, controls, robot fleet, and lane toggles
// ─────────────────────────────────────────────
import { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore.js';
import SimControls from './SimControls.jsx';
import RobotCard from './RobotCard.jsx';
import LaneControls from './LaneControls.jsx';

export default function Sidebar() {
  const { robots, selectedRobotId, selectRobot, waypoints, addRobot } = useSimulationStore();
  const [showAddRobot, setShowAddRobot] = useState(false);
  const [newRobotName, setNewRobotName] = useState('');
  const [newRobotWaypoint, setNewRobotWaypoint] = useState('A1');

  const handleAddRobot = () => {
    if (!newRobotName.trim()) return;
    addRobot(newRobotName.trim(), newRobotWaypoint);
    setNewRobotName('');
    setShowAddRobot(false);
  };

  return (
    <aside className="w-[280px] h-screen bg-gray-950 border-r border-gray-800/60 flex flex-col overflow-hidden shrink-0">
      <div className="px-4 py-4 border-b border-gray-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">LaneOS</h1>
            <p className="text-[10px] text-gray-500 -mt-0.5">Traffic Control Platform</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-gray-800/60">
        <SimControls />
      </div>

      <div className="flex-1 overflow-hidden flex flex-col border-b border-gray-800/60">
        <div className="px-4 pt-3 pb-2 flex justify-between items-center">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Robot Fleet ({robots.length})</h3>
          <button onClick={() => setShowAddRobot(!showAddRobot)} className="text-indigo-400 hover:text-indigo-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
        
        {showAddRobot && (
          <div className="px-4 pb-3 space-y-2">
            <input 
              type="text" 
              placeholder="Robot Name" 
              className="w-full bg-gray-900 border border-gray-700 text-white text-xs px-2 py-1.5 rounded focus:outline-none focus:border-indigo-500"
              value={newRobotName}
              onChange={e => setNewRobotName(e.target.value)}
            />
            <div className="flex gap-2">
              <select 
                className="w-1/2 bg-gray-900 border border-gray-700 text-white text-xs px-2 py-1 rounded focus:outline-none focus:border-indigo-500"
                value={newRobotWaypoint}
                onChange={e => setNewRobotWaypoint(e.target.value)}
              >
                {waypoints.map(wp => (
                  <option key={wp.id} value={wp.id}>{wp.id}</option>
                ))}
              </select>
              <button 
                onClick={handleAddRobot}
                className="w-1/2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-1 rounded font-medium transition-colors"
              >
                Add Robot
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5 scrollbar-thin">
          {robots.map(robot => (
            <RobotCard
              key={robot.id}
              robot={robot}
              isSelected={selectedRobotId === robot.id}
              onSelect={() => selectRobot(selectedRobotId === robot.id ? null : robot.id)}
            />
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        <LaneControls />
      </div>
    </aside>
  );
}
