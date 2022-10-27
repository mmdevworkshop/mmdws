import { readLines } from '../lib/util';

const { xmin, xmax, ymin, ymax } = (() => {
  const targetData = readLines(__dirname, 'input.txt')[0];
  const match = targetData.match(
    /target area: x=(?<x1>-?\d+)..(?<x2>-?\d+), y=(?<y1>-?\d+)..(?<y2>-?\d+)/
  );
  if (!match) {
    throw new Error(`failed to parse input: ${targetData}`);
  }
  const xs = [match.groups['x1'], match.groups['x2']].map((v) => parseInt(v));
  const ys = [match.groups['y1'], match.groups['y2']].map((v) => parseInt(v));
  return {
    xmin: Math.min(...xs),
    xmax: Math.max(...xs),
    ymin: Math.min(...ys),
    ymax: Math.max(...ys),
  };
})();

const sumton = (n: number) => (n * (n + 1)) / 2;
const invsumton = (m: number) => Math.sqrt(2 * m + 0.25) - 0.5;

// aim for the bottom of the target area, for the greatest step (and thus the greatest height)
const targetstep = Math.abs(ymin);

// the shot will go up until the y step is 0, then come back down.
// since this is symmetric, it will wind up at y=0 at some point.
// after it reaches 0, the next step should land it at the bottom
// of the target area, so our "up" velocity should be one _less_
// than this final step
const up = targetstep - 1;

// the inverse of "sum to n" will give us a fractional value, so
// we need to round it to an integer. we target the _nearest_ x
// coordinate, since that allows our final step to be the smallest
// (and thus, complete in the fewest steps). we round _up_ because
// rounding down would fall short of the target area.
const right = Math.ceil(invsumton(xmin));

interface StepRange {
  min: number;
  max: number;
}

function xStepRange(velocity: number, min: number, max: number): null | StepRange {
  const farthest = sumton(velocity);
  if (farthest < min) return null;

  const least = Math.floor(invsumton(farthest - min));
  if (farthest - sumton(least) > max) return null;

  if (farthest <= max) {
    return {
      min: velocity - least,
      max: Infinity,
    };
  }

  const greatest = Math.ceil(invsumton(farthest - max));
  if (farthest - sumton(greatest) < min) return null;

  return {
    min: velocity - least,
    max: velocity - greatest,
  };
}

function yDest(_yv: number, steps: number) {
  let yv = _yv;
  let y = 0;
  for (let step = 0; step < steps; step++) {
    y += yv;
    yv--;
  }
  return y;
}

function countYVelocities(min: number, max: number, steps: number): Set<number> {
  const res = new Set<number>();
  for (let yv = min; yv <= Math.abs(min) - 1; yv++) {
    const dest = yDest(yv, steps);
    if (dest >= min && dest <= max) res.add(yv);
  }
  return res;
}

const maxsteps = Math.abs(ymin) * 2;
const yVelocities: Set<number>[] = new Array(maxsteps + 1)
  .fill(0)
  .map((_, step) => countYVelocities(ymin, ymax, step));

function totalYVelocities(from: number, to: number): Set<number> {
  const merged = new Set<number>();

  for (let i = from; i <= to; i++) {
    if (i >= yVelocities.length) break;
    for (const yv of yVelocities[i].values()) {
      merged.add(yv);
    }
  }
  return merged;
}

let total = 0;
for (let xv = Math.ceil(invsumton(xmin)); xv <= xmax; xv++) {
  const range = xStepRange(xv, xmin, xmax);
  if (range == null) continue;
  total += totalYVelocities(range.min, range.max).size;
}

console.log(total);
