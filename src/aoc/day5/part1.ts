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

for (const { x1, y1, x2, y2 } of parsedLines) {
  if (x1 !== x2 && y1 !== y2) {
    continue;
  }

  for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      // create a row if one doesn't exist here
      grid[y] = grid[y] ?? [];

      // create a cell if one doesn't exist here; initialize it to
      // (possible previous value, or zero) + 1
      grid[y][x] = (grid[y][x] ?? 0) + 1;

      // if we've transitioned from 1 to 2, we have a new cell that overlaps. count it.
      if (grid[y][x] === 2) {
        count++;
      }
    }
  }
}

console.log(count);
