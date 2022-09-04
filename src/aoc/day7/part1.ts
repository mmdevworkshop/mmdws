import { readLines } from '../lib/util';

const vals = readLines(__dirname, 'input.txt')[0]
  .split(',')
  .map((v) => parseInt(v, 10));

vals.sort((a, b) => a - b);

function fuelCost(arr: number[], pos: number): number {
  return arr.map((v) => Math.abs(v - pos)).reduce((a, b) => a + b);
}

const pos = vals[Math.floor(vals.length / 2)];
console.log(pos, fuelCost(vals, pos));
