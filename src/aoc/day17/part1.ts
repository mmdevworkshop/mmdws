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

// not needed?
// // calculate our target height
// const targety = sumton(targetstep) + ymin;

// the shot will go up until the y step is 0, then come back down.
// since this is symmetric, it will wind up at y=0 at some point.
// after it reaches 0, the next step should land it at the bottom
// of the target area, so our "up" velocity should be one _less_
// than this final step
const up = targetstep - 1;

// not needed?
// // we need to be in the x-range after taking this many steps
// const numsteps = up + targetstep;

// the inverse of "sum to n" will give us a fractional value, so
// we need to round it to an integer. we target the _nearest_ x
// coordinate, since that allows our final step to be the smallest
// (and thus, complete in the fewest steps). we round _up_ because
// rounding down would fall short of the target area.
const right = Math.ceil(invsumton(xmin));

// type ProbeState = { x: number; y: number; xv: number; yv: number };
// const step = ({ x: _x, y: _y, xv: _xv, yv: _yv }: ProbeState): ProbeState => {
//   const x = _x + _xv;
//   const y = _y + _yv;
//   const xv = Math.max(_xv - 1, 0); // TODO: if we have to, deal with negative velocity
//   const yv = _yv - 1;
//   return { x, y, xv, yv };
// };

// let state: ProbeState = { x: 0, y: 0, xv: right, yv: up };
// console.log(state);
// while (state.x < xmax && state.y > ymin) {
//   state = step(state);
//   console.log(state);
// }

console.log('max height achieved', sumton(up));
