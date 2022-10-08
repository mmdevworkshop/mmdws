import { readLines } from '../lib/util';

import { MinPriorityQueue } from '@datastructures-js/priority-queue';

interface Node {
  x: number;
  y: number;
  cost: number;
  neighbors: Node[];
  cameFrom: Node | undefined;
  gScore: number;
  fScore: number;
}
const { start, goal } = (() => {
  const costGrid: number[][] = readLines(__dirname, 'input.txt').map((row) =>
    row.split('').map((cost) => parseInt(cost, 10))
  );

  const nodes: Node[][] = [];
  // create nodes
  for (let y = 0; y < costGrid.length; y++) {
    const costRow = costGrid[y];
    nodes[y] = [];

    for (let x = 0; x < costRow.length; x++) {
      nodes[y][x] = {
        x,
        y,
        cost: costRow[x],
        neighbors: [],
        cameFrom: undefined,
        gScore: Infinity,
        fScore: Infinity,
      };
    }
  }

  // bind edges
  for (let y = 0; y < costGrid.length; y++) {
    const costRow = costGrid[y];

    for (let x = 0; x < costRow.length; x++) {
      const node = nodes[y][x];

      if (x !== costRow.length - 1) {
        // if not rightmost, add right neighbor
        node.neighbors.push(nodes[y][x + 1]);
      }
      if (y !== costGrid.length - 1) {
        // if not bottommost, add bottom neighbor
        node.neighbors.push(nodes[y + 1][x]);
      }
      if (x > 0) {
        // if not leftmost, add left neighbor
        node.neighbors.push(nodes[y][x - 1]);
      }
      if (y > 0) {
        // if not topmost, add top neighbor
        node.neighbors.push(nodes[y - 1][x]);
      }
    }
  }

  const start = nodes.slice(0)[0].slice(0)[0];
  const goal = nodes.slice(-1)[0].slice(-1)[0];
  return { start, goal };
})();

const taxi = (from: Node, to: Node) => Math.abs(from.x - to.x) + Math.abs(from.y - to.y);

// function reconstruct_path(cameFrom, current)
//     total_path := {current}
//     while current in cameFrom.Keys:
//         current := cameFrom[current]
//         total_path.prepend(current)
//     return total_path

function calculateRisk(_node: Node): number {
  let node = _node;
  let risk = 0;
  while (node.cameFrom) {
    risk += node.cost;
    node = node.cameFrom;
  }
  return risk;
}

// // A* finds a path from start to goal.
// // h is the heuristic function. h(n) estimates the cost to reach goal from node n.
// function A_Star(start, goal, h)
function astar(start: Node, goal: Node, h: (from: Node, to: Node) => number) {
  // The set of discovered nodes that may need to be (re-)expanded.
  // Initially, only the start node is known.
  // This is usually implemented as a min-heap or priority queue rather than a hash-set.
  const pq = new MinPriorityQueue<Node>((node) => node.fScore);
  pq.push(start);

  const openSet: Set<Node> = new Set();
  openSet.add(start);

  // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from start
  // to n currently known.
  // const cameFrom: Map<Node, Node> = new Map(); -- converted to a property of Node

  // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
  // const gScore: DefaultMap<Node, number> = new DefaultMap(Infinity);
  // gScore.set(start, 0); -- converted to a property of Node

  // mutating sucks -- should use maps after all, i guess?
  start.gScore = 0;

  // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
  // how cheap a path could be from start to finish if it goes through n.
  // const fScore: DefaultMap<Node, number> = new DefaultMap(Infinity);
  // fScore.set(start, h(start)); -- converted to a property of Node
  start.fScore = h(start, goal);

  while (openSet.size > 0) {
    // This operation can occur in O(Log(N)) time if openSet is a min-heap or a priority queue
    //  current := the node in openSet having the lowest fScore[] value
    //  openSet.Remove(current)
    const current = pq.pop();
    openSet.delete(current);
    if (current === goal) {
      return calculateRisk(current);
    }

    // for each neighbor of current
    for (const neighbor of current.neighbors) {
      // d(current,neighbor) is the weight of the edge from current to neighbor
      // tentative_gScore is the distance from start to the neighbor through current
      // tentative_gScore := gScore[current] + d(current, neighbor)
      const tmpG = current.gScore + neighbor.cost;
      // if tentative_gScore < gScore[neighbor]
      if (tmpG < neighbor.gScore) {
        // This path to neighbor is better than any previous one. Record it!
        neighbor.cameFrom = current;
        neighbor.gScore = tmpG;
        neighbor.fScore = tmpG + h(neighbor, goal);
        if (!openSet.has(neighbor)) {
          pq.push(neighbor);
          openSet.add(neighbor);
        }
      }
    }
  }
  throw new Error('no path found');
}

console.log(astar(start, goal, taxi));
