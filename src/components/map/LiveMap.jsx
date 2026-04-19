// ─────────────────────────────────────────────
// FILE: src/components/map/LiveMap.jsx
// PURPOSE: Main Konva canvas rendering the warehouse map, robots, lanes, and overlays
// ─────────────────────────────────────────────
import { useRef, useEffect, useCallback, useState } from 'react';
import { Stage, Layer, Circle, Text, Rect, Group } from 'react-konva';
import { useSimulationStore } from '../../store/simulationStore.js';
import LaneLayer from './LaneLayer.jsx';
import RobotLayer from './RobotLayer.jsx';
import PathLayer from './PathLayer.jsx';

export default function LiveMap() {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const animFrameRef = useRef(0);

  const {
    waypoints, lanes, robots, heatmap,
    showHeatmap, showReservations, showPaths,
    selectedRobotId, selectRobot,
    running, speed, runTick, tick,
  } = useSimulationStore();

  // Resize handler
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simulation loop
  const tickAccumulator = useRef(0);
  const lastTimeRef = useRef(0);

  const gameLoop = useCallback((timestamp) => {
    if (!running) return;

    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }

    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // Target: speed × 60 ticks per second
    const ticksPerMs = (speed * 60) / 1000;
    tickAccumulator.current += delta * ticksPerMs;

    const maxTicksPerFrame = speed * 3; // cap to prevent freezing
    let ticksThisFrame = 0;

    while (tickAccumulator.current >= 1 && ticksThisFrame < maxTicksPerFrame) {
      runTick();
      tickAccumulator.current -= 1;
      ticksThisFrame++;
    }

    if (tickAccumulator.current > maxTicksPerFrame) {
      tickAccumulator.current = 0;
    }

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [running, speed, runTick]);

  useEffect(() => {
    if (running) {
      lastTimeRef.current = 0;
      tickAccumulator.current = 0;
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [running, gameLoop]);

  // Grid dots
  const gridDots = [];
  for (let x = 20; x < 1100; x += 40) {
    for (let y = 20; y < 700; y += 40) {
      gridDots.push({ x, y });
    }
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-950 rounded-xl overflow-hidden relative">
      <div className="absolute top-3 right-3 z-10 bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-gray-700/50">
        <span className="text-xs text-gray-400 font-mono">Tick: {String(tick).padStart(5, '0')}</span>
      </div>

      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          {/* Grid background dots */}
          {gridDots.map((dot, i) => (
            <Circle
              key={i}
              x={dot.x}
              y={dot.y}
              radius={1}
              fill="#374151"
              opacity={0.4}
            />
          ))}

          {/* Lanes */}
          <LaneLayer
            lanes={lanes}
            waypoints={waypoints}
            showHeatmap={showHeatmap}
            showReservations={showReservations}
            heatmap={heatmap}
          />

          {/* Paths */}
          <PathLayer
            robots={robots}
            waypoints={waypoints}
            showPaths={showPaths}
            selectedRobotId={selectedRobotId}
          />

          {/* Waypoints */}
          <Group>
            {waypoints.map(wp => {
              // Check if it's an intersection (4+ lanes meet)
              const connectedLanes = lanes.filter(
                l => l.from === wp.id || l.to === wp.id
              );
              const isIntersection = connectedLanes.length >= 4;

              return (
                <Group key={wp.id}>
                  {isIntersection && (
                    <Rect
                      x={wp.x - 14}
                      y={wp.y - 14}
                      width={28}
                      height={28}
                      fill="#1E40AF"
                      cornerRadius={4}
                      opacity={0.3}
                    />
                  )}
                  <Circle
                    x={wp.x}
                    y={wp.y}
                    radius={isIntersection ? 8 : 6}
                    fill={isIntersection ? '#3B82F6' : '#4B5563'}
                    stroke="#1F2937"
                    strokeWidth={2}
                  />
                  <Text
                    x={wp.x - 10}
                    y={wp.y + 12}
                    text={wp.label}
                    fontSize={10}
                    fill="#9CA3AF"
                    fontFamily="monospace"
                    align="center"
                    width={20}
                  />
                </Group>
              );
            })}
          </Group>

          {/* Robots */}
          <RobotLayer
            robots={robots}
            waypoints={waypoints}
            selectedRobotId={selectedRobotId}
            onSelectRobot={selectRobot}
          />
        </Layer>
      </Stage>
    </div>
  );
}
