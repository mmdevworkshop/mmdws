import * as assert from 'node:assert';
import { difference } from '../lib/setops';

import { readLines } from '../lib/util';

interface Node {
  edges: Set<Node>;
  big: boolean;
  start: boolean;
  end: boolean;
  name: string;
}

function constructCaveSystem(file: string = 'example1.txt'): Node {
  const caves: {
    [key: string]: Node;
  } = Object.create(null);

  let startNode = null;

  const makeNode = (name: string): Node => {
    const res: Node = Object.assign(Object.create(null), {
      edges: new Set(),
      big: name === name.toUpperCase(),
      start: name === 'start',
      end: name === 'end',
      name,
    });
    if (res.start) {
      startNode = res;
    }
    return res;
  };

  for (const line of readLines(__dirname, file)) {
    const [leftStr, rightStr] = line.split('-');

    // get or create left node
    const left: Node = leftStr in caves ? caves[leftStr] : makeNode(leftStr);
    caves[leftStr] = left;

    // get or create right node
    const right: Node = rightStr in caves ? caves[rightStr] : makeNode(rightStr);
    caves[rightStr] = right;

    // link caves
    left.edges.add(right);
    right.edges.add(left);

    // if we have two big caves linked to each other, we will infinite loop
    assert.notStrictEqual(left.big && right.big, true);
  }

  assert.notStrictEqual(startNode, null);
  return startNode;
}

interface Step {
  here: Node;
  nexts: Set<Node>;
  seen: Set<Node>;
  path: string[];
}

const startCave = constructCaveSystem(process.argv[2]);
const queue: Step[] = [{ here: startCave, seen: new Set(), nexts: startCave.edges, path: [] }];
let numPaths = 0;

while (queue.length > 0) {
  const step = queue.pop();

  const newSeen = new Set(step.seen);
  const newPath = step.path.concat(step.here.name);
  if (!step.here.big) {
    // we have technically "seen" the big cave, but we want to be able to
    // revisit it, so we won't add it to the "seen" list, whose only purpose
    // is to prevent revisiting a node
    newSeen.add(step.here);
  }

  for (const next of step.nexts) {
    // don't add a terminal path (reached "end") to the queue
    if (next.end) {
      numPaths++;
      // console.log('found path to end: ', newPath.concat(next.name).join(', '));
      continue;
    }

    const nexts = difference(next.edges, newSeen);
    // don't add a terminal path (dead end) to the queue
    if (nexts.size === 0) {
      // console.log('abandoned path to dead end: ', newPath.concat(next.name).join(', '));
      continue;
    }

    queue.push({
      here: next,
      seen: newSeen,
      nexts,
      path: newPath,
    });
  }
}

console.log(numPaths);
