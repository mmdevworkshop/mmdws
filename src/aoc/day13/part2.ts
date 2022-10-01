import { readLines } from '../lib/util';
import * as assert from 'node:assert';

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

class Paper {
  private grid: number[][] = [];

  mark({ x, y }: Coord): void {
    this.grid[y] = this.grid[y] ?? [];
    this.grid[y][x] = 1;
  }
  fold({ axis, pos }: Fold): void {
    const grid = this.grid;

    // assumes nothing will be folded to negative address space
    if (axis === 'y') {
      assert.ok(grid.length - pos - 1 <= pos);
    }

    const maxI = grid.length;
    for (let rowI = 0; rowI < maxI; rowI++) {
      // ensure that every row exists
      grid[rowI] = grid[rowI] ?? [];

      const row = grid[rowI];

      if (axis === 'x') {
        assert.ok(row.length - pos - 1 <= pos);
        // length = 11
        // pos = 7
        // pos*2 - i -> reflected, e.g. (7*2)-9 = 5
        // 0 1 2 3 4 5 6 7 8 9 10
        //               ^ fold
        //         3 2 1< >1 2  3
        for (let colI = pos + 1; colI < row.length; colI++) {
          // mark positions to the left of "pos" if their mirror on the right
          // is marked
          if (row[colI]) {
            row[pos * 2 - colI] = 1;
          }
        }
        // truncate the row to the new "folded" size
        row.length = pos;
      }

      if (axis === 'y') {
        if (rowI >= pos) {
          // truncate the row to the new "folded" size
          grid.length = pos;

          // exit early; we've done everything we need to
          break;
        }

        // if there's data to copy from, copy it all over to "here"
        if (grid[pos * 2 - rowI]) {
          grid[pos * 2 - rowI].forEach((val, colI) => {
            if (val) {
              grid[rowI][colI] = val;
            }
          });
        }
      }
    }
  }

  count(): number {
    let sum = 0;
    for (const row of this.grid) {
      if (!row) continue;
      for (const val of row) {
        if (!val) continue;
        sum++;
      }
    }
    return sum;
  }

  print() {
    const height = this.grid.length - 1;
    const width = this.grid.reduce((a, b) => Math.max(a, b ? b.length : 0), 0) - 1;

    for (let y = 0; y <= height; y++) {
      for (let x = 0; x <= width; x++) {
        process.stdout.write(this.grid?.[y]?.[x] ? '#' : ' ');
      }
      process.stdout.write('\n');
    }
    process.stdout.write('\n');
  }
}

const paper = new Paper();

for (const coord of coords) {
  paper.mark(coord);
}
for (const fold of folds) {
  paper.fold(fold);
}
paper.print();

// console.log(paper.count());

// optimization: pre-calculate the destination of any given coordinate, and
// build the grid in one pass
