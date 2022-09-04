import { readLines } from '../lib/util';

const vals = readLines(__dirname, 'input.txt')[0]
  .split(',')
  .map((v) => parseInt(v, 10));

vals.sort((a, b) => a - b);

function fuelCost(arr: number[], pos: number): number {
  return arr
    .map((v) => {
      const distance = Math.abs(v - pos);
      return (distance * (distance + 1)) / 2;
    })
    .reduce((a, b) => a + b);
}

let pos = vals[Math.floor(vals.length / 2)]; // initial guess
let cost = fuelCost(vals, pos);

let left = fuelCost(vals, pos - 1);
let right = fuelCost(vals, pos + 1);

let dir: number;
if (cost < left && cost < right) {
  // not really going to receive data that hits this case...
  console.log(pos, cost);
  process.exit();
} else if (left < cost) {
  dir = -1;
} else if (right < cost) {
  dir = 1;
}

while (true) {
  if (pos + dir === vals.length || pos + dir < 0) {
    throw new Error('unexpectedly ran off the end of the array');
  }

  let newCost = fuelCost(vals, pos + dir);
  if (newCost >= cost) {
    break;
  }

  cost = newCost;
  pos = pos + dir;
}

console.log(pos, cost);
