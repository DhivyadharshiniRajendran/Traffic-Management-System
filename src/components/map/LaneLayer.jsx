// ─────────────────────────────────────────────
// FILE: src/components/map/LaneLayer.jsx
// PURPOSE: Render all lanes on the Konva canvas with type-based coloring
// ─────────────────────────────────────────────
import { Line, Arrow, Group, Text } from 'react-konva';

function getLaneColor(laneType) {
  switch (laneType) {
    case 'normal': return '#6B7280';
    case 'narrow': return '#F97316';
    case 'intersection': return '#3B82F6';
    case 'human_zone': return '#EF4444';
    default: return '#6B7280';
  }
}

function getHeatmapColor(score) {
  if (score < 0.25) return { color: 'transparent', opacity: 0 };
  if (score < 0.5) return { color: '#FACC15', opacity: 0.4 };
  if (score < 0.75) return { color: '#F97316', opacity: 0.5 };
  return { color: '#EF4444', opacity: 0.65 };
}

export default function LaneLayer({ lanes, waypoints, showHeatmap, showReservations, heatmap }) {
  const wpMap = new Map();
  for (const wp of waypoints) wpMap.set(wp.id, wp);

  const heatmapMap = new Map();
  for (const cell of heatmap) heatmapMap.set(cell.laneId, cell);

  return (
    <Group>
      {lanes.map(lane => {
        const fromWp = wpMap.get(lane.from);
        const toWp = wpMap.get(lane.to);
        if (!fromWp || !toWp) return null;

        const color = getLaneColor(lane.laneType);
        const thickness = lane.directed ? 3 : 2;
        const midX = (fromWp.x + toWp.x) / 2;
        const midY = (fromWp.y + toWp.y) / 2;
        const heatCell = heatmapMap.get(lane.id);
        const heatColor = getHeatmapColor(lane.congestionScore);

        return (
          <Group key={lane.id}>
            {/* Base lane line */}
            {lane.directed ? (
              <Arrow
                points={[fromWp.x, fromWp.y, toWp.x, toWp.y]}
                stroke={color}
                strokeWidth={thickness + 1}
                pointerLength={14}
                pointerWidth={14}
                fill={color}
                opacity={1.0}
              />
            ) : (
              <Line
                points={[fromWp.x, fromWp.y, toWp.x, toWp.y]}
                stroke={color}
                strokeWidth={thickness}
                opacity={0.7}
              />
            )}

            {/* Heatmap overlay */}
            {showHeatmap && heatColor.opacity > 0 && (
              <>
                <Line
                  points={[fromWp.x, fromWp.y, toWp.x, toWp.y]}
                  stroke={heatColor.color}
                  strokeWidth={thickness + 6}
                  opacity={heatColor.opacity}
                  lineCap="round"
                />
                <Text
                  x={midX - 12}
                  y={midY - 18}
                  text={`${Math.round(lane.congestionScore * 100)}%`}
                  fontSize={9}
                  fill="#fff"
                  fontStyle="bold"
                  align="center"
                />
              </>
            )}

            {/* Reservation indicator */}
            {showReservations && lane.requiresReservation && (
              <Line
                points={[fromWp.x, fromWp.y, toWp.x, toWp.y]}
                stroke="#A855F7"
                strokeWidth={thickness + 4}
                dash={[6, 4]}
                opacity={lane.currentOccupants.length > 0 ? 0.8 : 0.3}
                lineCap="round"
              />
            )}

            {/* Hotspot pulse indicator */}
            {showHeatmap && heatCell?.hotspot && (
              <Line
                points={[fromWp.x, fromWp.y, toWp.x, toWp.y]}
                stroke="#EF4444"
                strokeWidth={thickness + 10}
                opacity={0.2}
                lineCap="round"
              />
            )}
          </Group>
        );
      })}
    </Group>
  );
}
