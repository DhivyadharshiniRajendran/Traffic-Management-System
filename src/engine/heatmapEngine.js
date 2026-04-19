// ─────────────────────────────────────────────
// FILE: src/engine/heatmapEngine.js
// PURPOSE: Compute lane congestion scores and heatmap data per tick
// ─────────────────────────────────────────────

export function updateUsageCounts(lanes) {
  for (const lane of lanes) {
    if (lane.currentOccupants.length > 0) {
      lane.usageCount += lane.currentOccupants.length;
    }
  }
}

export function recomputeCongestion(lanes) {
  let maxUsage = 1;
  for (const lane of lanes) {
    if (lane.usageCount > maxUsage) {
      maxUsage = lane.usageCount;
    }
  }

  for (const lane of lanes) {
    const occupancyFactor = (lane.currentOccupants.length / 2) * 0.7;
    const usageFactor = (lane.usageCount / maxUsage) * 0.3;
    lane.congestionScore = Math.min(1, occupancyFactor + usageFactor);
  }
}

export function computeHeatmap(lanes) {
  let maxFreq = 1;
  for (const lane of lanes) {
    if (lane.usageCount > maxFreq) maxFreq = lane.usageCount;
  }

  return lanes.map(lane => ({
    laneId: lane.id,
    frequency: lane.usageCount / maxFreq,
    occupancy: lane.currentOccupants.length / 2,
    hotspot: lane.congestionScore > 0.75,
  }));
}
