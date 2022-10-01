import { readLines } from '../lib/util';

interface Coord {
  x: number;
  y: number;
}
interface Fold {
  axis: 'y' | 'x';
  pos: number;
}
const { coords, folds } = ((): { coords: Coord[]; folds: Fold[] } => {
  const rawLines = readLines(__dirname, 'input.txt');

  const coords = rawLines
    .filter((v) => /^\d+,\d+/.test(v)) // keep only "x,y" lines
    .map((v) => v.split(',').map((n) => parseInt(n, 10))) // unpack to [int, int]
    .map(([x, y]) => ({ x, y })); // convert to {x: int, y: int}

  const folds = rawLines
    .filter((v) => /^fold/.test(v)) // keep only "fold along..." lines
    .map((v) => v.match(/fold along (?<axis>x|y)=(?<pos>\d+)/)) // unpack with regex: find axis and position
    .map(
      ({ groups: { axis, pos } }): Fold => ({ axis: axis as Fold['axis'], pos: parseInt(pos, 10) })
    ); // convert to plain object

  return { coords, folds };
})();

const finalX: number[] = [];
const finalY: number[] = [];
for (const { axis, pos } of folds) {
  const arr = axis === 'x' ? finalX : finalY;
  // 0 1 2  3  4 5 (6) 5 4 3 2 1 0 -- index 7
  // . . .  .  . .  .  5 4 3 2 1 0 --  -> index 5
  // 0 1 2 (3) 2 1                 --  -> index 2

  // we can write "the numbers to the right of the fold" as a position
  // where that value will "wind up" after the fold, up to the distance
  // of the fold from 0 -- "as far as it can reach".
  for (let i = pos + 1; i <= pos * 2; i++) {
    arr[i] = pos * 2 - i;
  }
  // then, we can iterate over the following values and "inherit" the
  // values we just produced, indirecting them again. these two can't
  // conflict, since the rules mean that anything to the right of
  // a fold point becomes an invalid index after the fold, and (experimentally)
  // our data in such that the left side of the fold to be >= the right side
  for (let i = pos * 2 + 1; i < arr.length; i++) {
    // if we reference a position that doesn't have a redirect defined yet,
    // stick with our current value rather than overwrite with undefined
    arr[i] = arr[arr[i]] ?? arr[i];
  }
}

const grid: number[][] = [];
for (const { x, y } of coords) {
  const ry = finalY[y] ?? y,
    rx = finalX[x] ?? x;
  grid[ry] = grid[ry] ?? [];
  grid[ry][rx] = 1;
}

function print() {
  const height = grid.length - 1;
  const width = grid.reduce((a, b) => Math.max(a, b ? b.length : 0), 0) - 1;

  for (let y = 0; y <= height; y++) {
    for (let x = 0; x <= width; x++) {
      process.stdout.write(grid?.[y]?.[x] ? '#' : ' ');
    }
    process.stdout.write('\n');
  }
  process.stdout.write('\n');
}

print();
