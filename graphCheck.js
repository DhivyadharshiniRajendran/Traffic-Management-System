const lanes = [
  { from: 'A1', to: 'B1', directed: false },
  { from: 'B1', to: 'C1', directed: true }, 
  { from: 'C1', to: 'D1', directed: false },
  { from: 'D1', to: 'E1', directed: true }, 

  { from: 'A2', to: 'B2', directed: false },
  { from: 'B2', to: 'C2', directed: true },
  { from: 'C2', to: 'D2', directed: true },
  { from: 'D2', to: 'E2', directed: false },

  { from: 'A3', to: 'B3', directed: true }, 
  { from: 'B3', to: 'C3', directed: true }, 
  { from: 'C3', to: 'D3', directed: false },
  { from: 'D3', to: 'E3', directed: true }, 

  { from: 'A4', to: 'B4', directed: false },
  { from: 'B4', to: 'C4', directed: true }, 
  { from: 'C4', to: 'D4', directed: true }, 
  { from: 'D4', to: 'E4', directed: false },

  { from: 'A1', to: 'A2', directed: false }, 
  { from: 'A2', to: 'A3', directed: false },
  { from: 'A3', to: 'A4', directed: true }, 

  { from: 'B1', to: 'B2', directed: false },
  { from: 'B2', to: 'B3', directed: true }, 
  { from: 'B3', to: 'B4', directed: false },

  { from: 'C1', to: 'C2', directed: true }, 
  { from: 'C2', to: 'C3', directed: true }, 
  { from: 'C3', to: 'C4', directed: false },

  { from: 'D1', to: 'D2', directed: false },
  { from: 'D2', to: 'D3', directed: true }, 
  { from: 'D3', to: 'D4', directed: false },

  { from: 'E1', to: 'E2', directed: true }, 
  { from: 'E2', to: 'E3', directed: false },
  { from: 'E3', to: 'E4', directed: true }, 

  { from: 'B2', to: 'C3', directed: true }, 
  { from: 'C2', to: 'B3', directed: true }, 
  { from: 'D2', to: 'C3', directed: true }, 
  { from: 'C2', to: 'D3', directed: true }, 
];

function getNeighbors(node) {
    let neighbors = [];
    for(let l of lanes) {
        if(l.directed) {
            if(l.from === node) neighbors.push(l.to);
        } else {
            if(l.from === node) neighbors.push(l.to);
            if(l.to === node) neighbors.push(l.from);
        }
    }
    return neighbors;
}

let visited = new Set();
function dfs(node) {
    if(visited.has(node)) return;
    visited.add(node);
    for(let n of getNeighbors(node)) dfs(n);
}

dfs('E4');
console.log('Nodes reachable from E4: ', Array.from(visited).sort());
if (!visited.has('A1')) {
    console.log("Path E4 to A1 does not exist.");
}
