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
  avoid: Set<Node>;
  path: string[];
  revisitNode?: Node;
  didRevisit: boolean;
}

const startCave = constructCaveSystem(process.argv[2]);
const queue: Step[] = [
  {
    here: startCave,
    avoid: new Set(),
    nexts: startCave.edges,
    path: [startCave.name],
    revisitNode: undefined,
    didRevisit: false,
  },
];
let numPaths = 0;

function enumerateSteps(
  { avoid, here, nexts, path, didRevisit, revisitNode }: Step,
  revisit: boolean = false
): Step[] {
  const newAvoid = new Set(avoid);
  if (!revisit && !here.big) {
    newAvoid.add(here);
  }

  return [...nexts].map((next) => ({
    here: next,
    avoid: newAvoid,
    nexts: difference(next.edges, newAvoid),
    path: path.concat(next.name),
    revisitNode: revisit ? here : revisitNode,
    didRevisit: didRevisit || (!revisit && here === revisitNode), //prettier-ignore
  }));
}

while (queue.length > 0) {
  const step = queue.pop();

  const nextSteps: Step[] = [];
  // for each "step" in the queue, we have either "already chosen a node to revisit"
  // or we have not yet. if we have not yet, we push new steps with "this" node as
  // "the one we selected to revisit" as well. we only do this for small nodes that
  // are neither start nor end.
  if (!step.revisitNode && !step.here.big && !step.here.start && !step.here.end) {
    Array.prototype.push.apply(nextSteps, enumerateSteps(step, true));
  }
  Array.prototype.push.apply(nextSteps, enumerateSteps(step));

  Array.prototype.push.apply(
    queue,
    nextSteps.filter((step) => {
      // this is a bit ugly: we need to filter out all the terminal paths
      // from the candidates we generated above. we _also_ need to count
      // the successful paths, which we just so happen to "know" here,
      // as we filter them out. so, we have a filter with side effects.
      // this feels bad, but gets the job done well enough

      // don't add a terminal path (reached "end") to the queue
      if (step.here.end) {
        if (step.revisitNode !== undefined && !step.didRevisit) {
          // console.log("abandoned path - intended to revisit, but didn't", step.path.join(','));
          return false;
        } else {
          numPaths++;
          // console.log('found path to end: ', step.path.join(','));
          return false;
        }
      }

      // don't add a terminal path (dead end) to the queue
      if (step.nexts.size === 0) {
        // console.log('abandoned path to dead end: ', step.path.join(','));
        return false;
      }

      // everything else: keep in the array; add to queue
      return true;
    })
  );
}

console.log(numPaths);
