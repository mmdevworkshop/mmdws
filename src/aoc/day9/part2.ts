import { readLines } from '../lib/util';
import * as assert from 'node:assert';

// IIFE: get the row size, and return a single flat array
// of all the rows concatenated together
const { rowsize, heightmap } = (() => {
  let rowsize = NaN;

  const heightmap = readLines(__dirname, 'input.txt').flatMap((line) => {
    // initialize rowsize the first time, otherwise maintain
    // the same value as before
    if (isNaN(rowsize)) {
      rowsize = line.length;
    }

    assert.equal(rowsize, line.length, 'all rows must be the same length!');

    return line.split('').map((v) => parseInt(v, 10));
  });

  return { rowsize, heightmap };
})();

// in basin map:
// 0 is uninitialized OR a corresponding height map value of "9" (never will be a real value)
// positive values are a reference to the basin id
const basinmap = new Array(heightmap.length).fill(0);

function printMap(
  map: number[],
  rowsize: number,
  maxDigits: number = 1
): string {
  let final = [];
  let cols: string[] = [];
  let pad = ' '.repeat(maxDigits + 1);
  let i = 0;
  for (i = 0; i < map.length; i++) {
    if (i > 0 && i % rowsize === 0) {
      final.push(' ' + cols.join(' '));
      cols = [];
    }
    cols.push((pad + map[i].toString()).slice(-maxDigits - 1));
  }
  final.push(' ' + cols.join(' '));
  return final.join('\n').slice(1);
}

// basins get allocated as we encounter new heightmap positions; the index of this "basins"
// array is stored in the basinmap and inherited or merged as we process the heightmap.
// the value at that index is the total area of the basin at that id.
// if the value is NEGATIVE, it is a pointer to a different basin id: we had to merge
// two basins into a single basin, but rather than find all references in "basinmap" to
// the id that was invalidated, we instead flag in the basin tally itself that anything
// referencing the invalid id should redirect to the "merged-into" id
class Basins {
  private arr: number[] = [];
  private deref(pos: number): number {
    while (this.arr[pos] < 0) {
      pos = -this.arr[pos];
    }
    return pos;
  }
  inc(pos: number) {
    pos = this.deref(pos);
    this.arr[pos]++;
  }
  new(): number {
    const pos = this.arr.length;
    this.arr.push(0);
    return pos;
  }
  same(a: number, b: number): boolean {
    return this.deref(a) === this.deref(b);
  }
  merge(from: number, to: number) {
    from = this.deref(from);
    to = this.deref(to);
    this.arr[to] += this.arr[from];
    this.arr[from] = -to;
  }
  top(n: number): number[] {
    let min = Infinity;
    let top: number[] = [];
    for (const val of this.arr) {
      if (top.length < n) {
        top.push(val);
        min = Math.min(min, val);
        continue;
      }

      if (val <= min) {
        continue;
      }

      top[top.indexOf(min)] = val;
      min = Math.min(...top);
    }
    return top;
  }
}
const basins = new Basins();

// loop over heightmap:
for (let i = 0; i < heightmap.length; i++) {
  // check positions above or to the left (when valid)

  const thisVal = heightmap[i];
  if (thisVal === 9) {
    basinmap[i] = -1;
    // i can't be part of a basin; do nothing
    continue;
  }

  // position left = i - 1
  const leftVal = i > 0 && i % rowsize > 0 ? heightmap[i - 1] : 9;

  // position above = i - rowsize
  const upVal = i >= rowsize ? heightmap[i - rowsize] : 9;

  let basinId: number;

  if (leftVal < 9 && upVal < 9) {
    basinId = basinmap[i - rowsize];
    const otherId = basinmap[i - 1];

    // if BOTH positions are not 9, merge them (if they're different!)
    if (!basins.same(basinId, otherId)) {
      basins.merge(otherId, basinId);
    }
  } else if (leftVal < 9) {
    // if ONE of the other positions are not 9, inherit its basin id
    basinId = basinmap[i - 1];
  } else if (upVal < 9) {
    // if ONE of the other positions are not 9, inherit its basin id
    basinId = basinmap[i - rowsize];
  } else {
    // i'm a less-than-9 value, but values up and left of me are NOT:
    // start a new basin
    basinId = basins.new();
  }

  // add self to total
  // add one to the size, for the position we're currently processing
  basins.inc(basinId);

  // make sure we include a pointer to the basin we're a member of,
  // so that other cells can join it too
  basinmap[i] = basinId;
}

console.log(basins.top(3).reduce((a, b) => a * b));
