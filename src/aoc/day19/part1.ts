import assert from 'node:assert';
import { readLines } from '../lib/util';

const NUM_MATCHING_BEACONS = 12;
const NUM_OTHER_BEACONS = NUM_MATCHING_BEACONS - 1;

interface Coord {
  x: number;
  y: number;
  z: number;
}

interface Beacon extends Coord {}

interface Scanner extends Coord {}

interface IndexEntry {
  beacon1: Beacon;
  beacon2: Beacon;
  distance: number;
}

type Transform = (coord: Coord) => Coord;

const distance = (a: Coord, b: Coord): number =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);

const roll = ({ x, y, z }: Coord): Coord => ({ x, y: z, z: -y });
const cw = ({ x, y, z }: Coord): Coord => ({ x: -y, y: x, z });
const ccw = ({ x, y, z }: Coord): Coord => ({ x: y, y: -x, z });

const eq = ({ x: Ax, y: Ay, z: Az }: Coord, { x: Bx, y: By, z: Bz }: Coord): boolean =>
  Ax === Bx && Ay === By && Az === Bz;

const transformations: Transform[] = ((_coord: Coord) => {
  const results: Coord[] = [];

  // https://stackoverflow.com/a/58471362
  let coord = _coord;
  for (let ri = 0; ri < 6; ri++) {
    coord = roll(coord);
    results.push(coord);
    for (let ti = 0; ti < 3; ti++) {
      if (ri % 2 === 0) {
        coord = cw(coord);
      } else {
        coord = ccw(coord);
      }
      results.push(coord);
    }
  }

  const mapped = (v: number): string => {
    const sign = v < 0 ? '-' : '';
    const abs = Math.abs(v);
    const c = abs === 1 ? 'x' : abs === 2 ? 'y' : abs === 3 ? 'z' : null;
    assert.notStrictEqual(c, null);
    return `${sign}${c}`;
  };

  return results.map(
    ({ x, y, z }: Coord) =>
      new Function('{x, y, z}', `return {x: ${mapped(x)}, y: ${mapped(y)}, z: ${mapped(z)}};`)
  ) as Transform[];
})({ x: 1, y: 2, z: 3 });

const isEqual = (A: Coord, B: Coord): boolean => A.x === B.x && A.y === B.y && A.z === B.z;

class BeaconSet {
  scanners: Scanner[];
  beacons: Beacon[] = [];
  index: IndexEntry[] = [];
  seen: Map<string, Beacon> = new Map();

  addBeacons(beacons: Beacon[]) {
    const indexStart = this.beacons.length;

    for (const beacon of beacons) {
      const str = `${beacon.x},${beacon.y},${beacon.z}`;
      if (this.seen.has(str)) continue;
      this.seen.set(str, beacon);
      this.beacons.push(beacon);
    }

    this.updateIndex(indexStart);
  }

  updateIndex(start: number) {
    const len = this.beacons.length;
    for (let i = 0; i < len; i++) {
      for (let j = Math.max(start, i + 1); j < len; j++) {
        this.index.push({
          beacon1: this.beacons[i],
          beacon2: this.beacons[j],
          distance: distance(this.beacons[i], this.beacons[j]),
        });
      }
    }
    this.index.sort((a, b) => (a === null ? 1 : b === null ? -1 : a.distance - b.distance));
  }

  getDistancePairs(
    A: IndexEntry[],
    Astart: number,
    B: IndexEntry[],
    Bstart: number
  ): {
    matches: [IndexEntry, IndexEntry][];
    Anext: number;
    Bnext: number;
  } {
    const distance = A[Astart].distance;
    // there might be more than one pair on each side with the same distance;
    // find the span of pairs on both sides that have that distance and add
    // every combination of them to the working list

    let Arange = 0;
    while (Astart + Arange + 1 < A.length && A[Astart + Arange + 1].distance === distance) Arange++;

    let Brange = 0;
    while (Bstart + Brange + 1 < B.length && B[Bstart + Brange + 1].distance === distance) Brange++;

    const matches: [IndexEntry, IndexEntry][] = [];
    for (let a = 0; a <= Arange; a++) {
      const Ai: number = Astart + a;
      for (let b = a; b <= Brange; b++) {
        const Bi: number = Bstart + b;
        matches.push([A[Ai], B[Bi]]);
      }
    }

    return {
      matches,
      Anext: Astart + Arange + 1,
      Bnext: Bstart + Brange + 1,
    };
  }

  tryMerge(other: BeaconSet): boolean {
    const transform = this.findTransform(other);
    if (!transform) return false;

    this.addBeacons(other.beacons.map(transform));
    return true;
  }

  // determine if `this` and `other` contain >= maxMatches beacon-pairs with the same distance, orientation, and translation
  // if so, return a transform function that converts coordinates in B's frame of reference to A's frame of reference
  findTransform(other: BeaconSet): Transform | undefined {
    const A = this.index;
    const B = other.index;

    let Ai = 0;
    let Bi = 0;

    const matches: [IndexEntry, IndexEntry][] = [];

    while (Ai < A.length && Bi < B.length) {
      if (A[Ai].distance < B[Bi].distance) {
        Ai++;
        continue;
      }
      if (B[Bi].distance < A[Ai].distance) {
        Bi++;
        continue;
      }

      const { matches: newMatches, Anext, Bnext } = this.getDistancePairs(A, Ai, B, Bi);
      Ai = Anext;
      Bi = Bnext;
      Array.prototype.push.apply(matches, newMatches);
    }

    // matches is a list of distinct pairs of IndexEntry in `this`  with IndexEntry in `other`
    // for which the distance is equal. (an IndexEntry is a pair of beacons and their distance)

    for (const transform of this.validTransforms(matches, false)) {
      let count = 0;
      for (const [A, B] of matches) {
        if (isEqual(A.beacon1, transform(B.beacon1)) && isEqual(A.beacon2, transform(B.beacon2))) {
          count++;
        }
      }
      if (count >= NUM_OTHER_BEACONS) {
        return transform;
      }
    }

    for (const transform of this.validTransforms(matches, false)) {
      let count = 0;
      for (const [A, B] of matches) {
        if (isEqual(A.beacon1, transform(B.beacon2)) && isEqual(A.beacon2, transform(B.beacon1))) {
          count++;
        }
      }
      if (count >= NUM_OTHER_BEACONS) {
        return transform;
      }
    }

    return undefined;
  }

  private *validTransforms(matches: [IndexEntry, IndexEntry][], swap: boolean) {
    // for each of the 24 orientations...
    for (const transform of transformations) {
      const seenOffsets = new Set<string>();

      // for each pair of beacons of the same distance to another pair of beacons...
      for (const match of matches) {
        // calculate an offset from "beacon1" from A against either "beacon1" or "beacon2"
        // from B, depending on the value of the "swap" argument
        const { beacon1: A } = match[0];
        const { beacon1: _B1, beacon2: _B2 } = match[1];
        const B = swap ? transform(_B2) : transform(_B1);

        const ox = B.x - A.x;
        const oy = B.y - A.y;
        const oz = B.z - A.z;

        const ostr = `${ox},${oy},${oz}`;

        // only yield unique translations for each transformation
        if (!seenOffsets.has(ostr)) {
          seenOffsets.add(ostr);

          // this function will rotate a coordinate and then translate it,
          // such that a coordinate in "B"'s frame of reference will now
          // become a coordinate in "A"'s frame of reference
          const fn: Transform = (beacon: Coord) => {
            const { x, y, z } = transform(beacon);
            return { x: x - ox, y: y - oy, z: z - oz };
          };
          yield fn;
        }
      }
    }
  }
}

let beaconSets: BeaconSet[] = (() => {
  const lines = readLines(__dirname, 'input.txt');

  const res: BeaconSet[] = [];
  let current: Beacon[] = [];
  let scanner: Scanner;
  for (const line of lines) {
    const match = line.match(/--- scanner (?<id>\d+) ---/);
    if (match) {
      if (current.length) {
        const bs = new BeaconSet();
        bs.addBeacons(current);
        res.push(bs);
      }
      scanner = { x: 0, y: 0, z: 0 };
      current = [];
      continue;
    }

    const [x, y, z] = line.split(',').map(v => parseInt(v, 10));
    current.push({ x, y, z });
  }

  if (current.length) {
    const bs = new BeaconSet();
    bs.addBeacons(current);
    res.push(bs);
  }

  return res;
})();

const base = beaconSets.shift();
while (beaconSets.length > 0) {
  beaconSets = beaconSets.filter(other => !base.tryMerge(other));
}
console.log(base.seen.size);
