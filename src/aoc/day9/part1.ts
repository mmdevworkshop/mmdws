import { readLines } from '../lib/util';

const heightmap = readLines(__dirname, 'input.txt').map((v) =>
  v.split('').map((v) => parseInt(v, 10))
);

function isLowest(map: number[][], x: number, y: number): boolean {
  const cell = map[y][x];
  if (x - 1 >= 0 && map[y][x - 1] <= cell) {
    return false;
  }
  if (x + 1 < map[y].length && map[y][x + 1] <= cell) {
    return false;
  }
  if (y - 1 >= 0 && map[y - 1][x] <= cell) {
    return false;
  }
  if (y + 1 < map.length && map[y + 1][x] <= cell) {
    return false;
  }
  return true;
}

const lowPoints = [];
for (let y = 0; y < heightmap.length; y++) {
  for (let x = 0; x < heightmap[y].length; x++) {
    if (isLowest(heightmap, x, y)) {
      lowPoints.push(heightmap[y][x]);
    }
  }
}

const riskSum = lowPoints.map((v) => v + 1).reduce((a, b) => a + b);
console.log('result', riskSum);
