// ─────────────────────────────────────────────
// FILE: src/components/map/PathLayer.jsx
// PURPOSE: Render planned paths for each robot as dashed lines on the map
// ─────────────────────────────────────────────
import { Line, Group } from 'react-konva';

export default function PathLayer({ robots, waypoints, showPaths, selectedRobotId }) {
  if (!showPaths) return null;

  const wpMap = new Map();
  for (const wp of waypoints) wpMap.set(wp.id, wp);

  return (
    <Group>
      {robots.map(robot => {
        if (robot.path.length < 2) return null;
        const isSelected = robot.id === selectedRobotId;

        // Only show remaining path from current index
        const remainingPath = robot.path.slice(robot.pathIndex);
        const points = [];

        for (const wpId of remainingPath) {
          const wp = wpMap.get(wpId);
          if (wp) {
            points.push(wp.x, wp.y);
          }
        }

        if (points.length < 4) return null;

        return (
          <Line
            key={robot.id}
            points={points}
            stroke={robot.color}
            strokeWidth={isSelected ? 2 : 1}
            dash={[4, 4]}
            opacity={isSelected ? 0.7 : 0.25}
            lineCap="round"
            lineJoin="round"
          />
        );
      })}
    </Group>
  );
}
