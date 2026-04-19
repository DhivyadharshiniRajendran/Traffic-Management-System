// ─────────────────────────────────────────────
// FILE: src/engine/speedController.js
// PURPOSE: Compute robot speed based on lane type, congestion, following distance
// ─────────────────────────────────────────────

export function computeSpeed(robot, currentLane, robots) {
  if (robot.status === 'emergency') {
    return { speed: 0, followingRobotId: null };
  }

  if (!currentLane) {
    return { speed: robot.baseSpeed, followingRobotId: null };
  }

  let speed = robot.baseSpeed;

  // Apply lane maxSpeed cap
  speed = Math.min(speed, currentLane.maxSpeed);

  // human_zone: hard cap 0.5 m/s
  if (currentLane.laneType === 'human_zone') {
    speed = Math.min(speed, 0.5);
  }

  // critical safetyLevel: reduce speed by 50%
  if (currentLane.safetyLevel === 'critical') {
    speed *= 0.5;
  }

  // Congestion factor: reduce by (1 - congestionScore * 0.6)
  const congestionFactor = 1 - currentLane.congestionScore * 0.6;
  speed *= Math.max(0.1, congestionFactor);

  // Safe following distance check
  let followingRobotId = null;
  for (const other of robots) {
    if (other.id === robot.id) continue;
    if (other.currentLaneId !== currentLane.id) continue;
    if (other.status === 'idle') continue;

    const dx = other.position.x - robot.position.x;
    const dy = other.position.y - robot.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Only consider the other robot if it is actually AHEAD in the same lane
    // Since both are in the same lane, we can compare their 'progress'
    if (dist < robot.safeFollowingDistance && dist > 0 && other.progress > robot.progress) {
      // Robot ahead is within following distance
      followingRobotId = other.id;
      const leaderSpeed = other.speed;
      if (leaderSpeed === 0) {
        // Cascade breaker: if the leader has been stalled too long,
        // allow a slow crawl so this robot can reposition/replan
        if (other.stallTicks > 15) {
          speed = robot.baseSpeed * 0.1; // crawl speed to break livelock
        } else {
          speed = 0;
        }
      } else {
        speed = Math.min(speed, leaderSpeed * 0.85);
      }
      break;
    }
  }

  // Ensure speed stays non-negative
  speed = Math.max(0, speed);

  return { speed, followingRobotId };
}

export function shouldEmergencyStop(robot, currentLane) {
  if (!currentLane) return false;

  // Emergency for emergency-capable robots in human_zone with high congestion
  if (robot.personality === 'emergency') {
    if (currentLane.laneType === 'human_zone' && currentLane.congestionScore > 0.9) {
      return true;
    }
  }

  return false;
}

export function canRecoverFromEmergency(_robot, currentLane) {
  if (!currentLane) return true;
  return currentLane.congestionScore < 0.5;
}
