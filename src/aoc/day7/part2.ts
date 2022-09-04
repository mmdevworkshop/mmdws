import { readLines } from '../lib/util';

const vals = readLines(__dirname, 'input.txt')[0]
  .split(',')
  .map((v) => parseInt(v, 10));

vals.sort((a, b) => a - b);

const enum Direction {
  LEFT = -1,
  RIGHT = 1,
}

class FuelTracker {
  readonly crabs: number[];
  idx: number;
  pos: number;
  direction: Direction;

  fuelSpent: number = 0;
  acc: number = 0;
  crabsHere: number = 0;
  crabsPassed: number = 0;

  constructor(crabs: number[], direction: Direction) {
    this.crabs = crabs;
    this.idx = direction > 0 ? 0 : crabs.length - 1;
    this.pos = crabs[this.idx];
    this.direction = direction;

    this._countHere();
  }

  _countHere() {
    while (
      this.idx >= 0 &&
      this.idx < this.crabs.length &&
      this.crabs[this.idx] === this.pos
    ) {
      this.idx += this.direction;
      this.crabsHere++;
    }
  }

  fuelStep(): number {
    // we have to "move the one that increases the sum of spent fuel the least",
    // so we need a "hypothetical" fuel cost calculation before actually invoking
    // "move"

    const crabsPassed = this.crabsPassed + this.crabsHere;
    return this.acc + crabsPassed;
  }

  move(): number {
    // we just increased position, so if there
    // were any crabs at the last location, we
    // increase the amount of fuel we spend by
    // one per crab
    if (this.crabsHere > 0) {
      this.crabsPassed += this.crabsHere;
      this.crabsHere = 0;
    }

    this.acc += this.crabsPassed;
    this.fuelSpent += this.acc;

    this.pos += this.direction;
    this._countHere();

    return this.fuelSpent;
  }
}

const goingRight = new FuelTracker(vals, Direction.RIGHT);
const goingLeft = new FuelTracker(vals, Direction.LEFT);

while (goingLeft.pos !== goingRight.pos) {
  const leftMoveCost = goingLeft.fuelStep();
  const rightMoveCost = goingRight.fuelStep();
  if (leftMoveCost < rightMoveCost) {
    goingLeft.move();
  } else {
    goingRight.move();
  }
}
console.log(goingLeft.fuelSpent + goingRight.fuelSpent);
