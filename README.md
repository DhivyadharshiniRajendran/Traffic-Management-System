# LaneOS - Multi-Robot Traffic Control Platform

LaneOS is an advanced, algorithmically driven multi-robot warehouse simulation platform that physically routes, monitors, and evaluates the logic of multiple automated robots seamlessly dodging each other in dense intersection traffic.

## Core Features & Logic
++
### 1. Advanced Graph Traversal (A-Star Pathfinder)
Robots do not drive blindly. When assigned a destination, they utilize an optimized **A-Star (A*) Pathfinding Algorithm**. 
- They calculate Euclidean geometric distances for initial heuristics (`travel time`).
- The graph naturally respects rigid one-way walls (`directed: true` lanes) and freely permits undirected pathways.
- The algorithm calculates mathematically heavy penalties for restricted lanes (e.g. `human_zones` add significant base routing cost) to intentionally deter robots.
- The pathfinder monitors dynamic live heatmap metrics. If a lane becomes deadlocked, the algorithm attaches a massive temporary `extraCongestion` penalty, drastically forcing stranded robots to dynamically replan and take a scenic detour entirely around the jam!

### 2. Comprehensive Traffic Simulation (Safety Systems)
Robots implement strict physical safety mechanics:
- **Following Distance**: A robot seamlessly hits the brakes (`speed = 0`, status strictly drops to `"waiting"`) if it visually crosses inside the `safeFollowingDistance` sphere of the robot ahead of it.
- **Intersection Reservations**: Nodes designated as `intersection` are structurally locked out if a robot is entering perpendicularly. If access is denied, they wait. 
- **Graceful E-Stop Requests & Absolute Right-of-Way**: Operators can flag a robot for an E-Stop override. The entire fleet immediately honors this: all other non-emergency robots natively scan the Emergency vehicle's projected future path and absolutely freeze at their current waypoints if their paths dangerously intersect. The Emergency robot securely reaches its immediate destination with absolute right-of-way, completely clears its path array, and firmly locks its core into `"idle"`.

### 3. Dynamic Heatmap Overlay
The map possesses an internal `heatmapEngine` that mathematically monitors active traffic usage continuously:
- **`lane.congestionScore`**: Represents a visual, live-updating scaling metric (0 to 100%) showing physical congestion. 
- If standard volume exceeds mathematical capacity (e.g., >80%), the engine flags it as a `hotspot`, immediately broadcasting the threat back to the pathfinding algorithm. Visually on the React UI, heavily congested routes pulse a deep red aura.

### 4. Custom Deployments & Deadlock Resolvers
- **Manual Spawning**: Operators can deploy brand new custom-named robots into the environment mid-simulation. Select any free waypoint drop-point from the UI sidebar, map a fresh task, and let them merge.
- **Deadlock Resolution**: If traffic structurally breaks down into a cyclical dependency ring (e.g., Robot A waits for Robot B, who waits for C, who waits for A). The system periodically sweeps the array using **Depth-First Search (DFS)** geometry, determines the "lowest priority" waiting unit, completely wipes their active path array, and physically backs them up off the node line to force a structural reset of the intersection.

## Live Simulation Evaluation Metrics

- **Total Delay**: Every single computer *tick* (frame) that a robot's logic assesses as strictly `"waiting"` or `"stopped"` tallies exactly `+1` against this counter. It tracks the collective friction caused by heavy intersections.
- **Deadlocks Cleared**: Tracks the sum total of systemic DFS algorithmic path-wipes executed by the engine when forcing traffic-jam resets.
- **Throughput**: Computes *successful deliveries*. This strictly clicks `+1` on exactly the frame a robot completes its active layout and physically arrives at the coordinates of its `goalWaypointId`. Once an individual robot successfully tallies `12` full goal routes, it systematically retires itself gracefully to an `Idle` standby state and yields the floor.

  Video Link : https://drive.google.com/drive/folders/1Z8ufbjOVuswjVoD5gRJV9I4QzPt8lZNM
