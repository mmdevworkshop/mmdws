import { readLines } from '../lib/util';

const lines = readLines(__dirname, 'input.txt');
// .map((line) =>
//   line
//     .split(/ *-> */) //                              "0,9 -> 5,9"              ->  ["0,9", "5,9"]
//     .map(
//       (pair) =>
//         pair
//           .split(',') //                             ["0,9","5,9"]             ->  [["0", "9"], ["5", "9"]]
//           .map((n) => parseInt(n, 10)) //            [["0", "9"], ["5", "9"]]  ->  [[0, 9], [5, 9]]
//     )
// )
// .map(
//   ([[x1, y1], [x2, y2]]) => ({ x1, y1, x2, y2 }) //  [[0, 9], [5, 9]]          -> {x1: 0, y1: 9, x2: 5, y2: 9}
// );

const parsedLines: { x1: number; y1: number; x2: number; y2: number }[] = [];

for (const line of lines) {
  const [one, two] = line.split(/ *-> */);

  const [x1, y1] = one.split(',');
  const [x2, y2] = two.split(',');

  parsedLines.push({
    x1: parseInt(x1, 10),
    y1: parseInt(y1, 10),
    x2: parseInt(x2, 10),
    y2: parseInt(y2, 10),
  });
}

const grid: number[][] = [];
let count = 0;

function printGrid() {
  const maxRowLength = grid.reduce((max, row) => Math.max(max, row.length), 0);
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y] ?? [];
    for (let x = 0; x < maxRowLength; x++) {
      process.stdout.write((row[x] === undefined ? '.' : row[x]).toString(36));
    }
    console.log();
  }
}

for (const { x1, y1, x2, y2 } of parsedLines) {
  // x1 === x2 -> xDir = 0    e.g. x1=3 x2=3
  // x1 < x2   -> xDir = +1   e.g. x1=3 x2=5
  // x1 > x2   -> xDir = -1   e.g. x1=5 x2=3
  const xDir = x1 === x2 ? 0 : (x2 - x1) / Math.abs(x2 - x1);
  const yDir = y1 === y2 ? 0 : (y2 - y1) / Math.abs(y2 - y1);

  let x = x1,
    y = y1;
  while (true) {
    grid[y] = grid[y] ?? [];
    grid[y][x] = (grid[y][x] ?? 0) + 1;

    if (grid[y][x] === 2) {
      count++;
    }

    if (x === x2 && y === y2) {
      break;
    }

    x += xDir;
    y += yDir;
  }
}

// printGrid();

console.log(count);
