// ─────────────────────────────────────────────
// FILE: src/components/map/RobotLayer.jsx
// PURPOSE: Render robots as colored circles with direction arrows and status indicators
// ─────────────────────────────────────────────
import { Circle, Group, Arrow, Ring, Text } from 'react-konva';

export default function RobotLayer({ robots, waypoints, selectedRobotId, onSelectRobot }) {
  const wpMap = new Map();
  for (const wp of waypoints) wpMap.set(wp.id, wp);

  return (
    <Group>
      {robots.map(robot => {
        const isSelected = robot.id === selectedRobotId;
        const isEmergency = robot.status === 'emergency' || robot.emergencyStopRequested;

        // Direction arrow
        let arrowPoints = null;
        if (robot.path.length > robot.pathIndex + 1) {
          const nextWp = wpMap.get(robot.path[robot.pathIndex + 1]);
          if (nextWp) {
            const dx = nextWp.x - robot.position.x;
            const dy = nextWp.y - robot.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
              const nx = dx / dist;
              const ny = dy / dist;
              arrowPoints = [
                robot.position.x + nx * 14,
                robot.position.y + ny * 14,
                robot.position.x + nx * 26,
                robot.position.y + ny * 26,
              ];
            }
          }
        }

        return (
          <Group key={robot.id} onClick={() => onSelectRobot(robot.id)}>
            {/* Emergency pulsing ring */}
            {isEmergency && (
              <Ring
                x={robot.position.x}
                y={robot.position.y}
                innerRadius={16}
                outerRadius={24}
                fill="#EF4444"
                opacity={0.8}
                shadowColor="#EF4444"
                shadowBlur={15}
                shadowOpacity={1}
              />
            )}

            {/* Selection ring */}
            {isSelected && (
              <Ring
                x={robot.position.x}
                y={robot.position.y}
                innerRadius={15}
                outerRadius={19}
                fill="#FBBF2480"
              />
            )}

            {/* Robot body */}
            <Circle
              x={robot.position.x}
              y={robot.position.y}
              radius={12}
              fill={robot.color}
              stroke={isSelected ? '#FFF' : '#1F2937'}
              strokeWidth={isSelected ? 2.5 : 1.5}
              shadowColor={robot.color}
              shadowBlur={isSelected ? 12 : 6}
              shadowOpacity={0.5}
            />

            {/* Robot label */}
            <Text
              x={robot.position.x - 8}
              y={robot.position.y - 5}
              text={robot.id.replace('R0', 'R')}
              fontSize={9}
              fill="#FFF"
              fontStyle="bold"
              align="center"
              width={16}
            />

            {/* Direction arrow */}
            {arrowPoints && robot.status === 'moving' && (
              <Arrow
                points={arrowPoints}
                stroke={robot.color}
                strokeWidth={2}
                pointerLength={5}
                pointerWidth={4}
                opacity={0.8}
              />
            )}

            {/* Following distance indicator */}
            {robot.followingRobotId && (
              (() => {
                const leader = robots.find(r => r.id === robot.followingRobotId);
                if (leader) {
                  return (
                    <Arrow
                      points={[
                        robot.position.x,
                        robot.position.y,
                        leader.position.x,
                        leader.position.y,
                      ]}
                      stroke="#9CA3AF"
                      strokeWidth={1}
                      dash={[3, 3]}
                      pointerLength={4}
                      pointerWidth={3}
                      opacity={0.4}
                    />
                  );
                }
                return null;
              })()
            )}
          </Group>
        );
      })}
    </Group>
  );
}
