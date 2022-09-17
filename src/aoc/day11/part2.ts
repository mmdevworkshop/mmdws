import * as assert from 'node:assert';
import Debug from 'debug';
import chalk from 'chalk';

const tick1 = Debug('day11:tick1');
const tick2 = Debug('day11:tick2');
const tick3 = Debug('day11:tick3');

import { readLines } from '../lib/util';

const { rowsize, energy } = (() => {
  let rowsize = NaN;

  const energy = readLines(__dirname, 'input.txt').flatMap((line) => {
    // initialize rowsize the first time, otherwise maintain
    // the same value as before
    if (isNaN(rowsize)) {
      rowsize = line.length;
    }

    assert.equal(rowsize, line.length, 'all rows must be the same length!');

    return line.split('').map((v) => parseInt(v, 10));
  });

  return { rowsize, energy };
})();

const render = () => renderMap(energy, rowsize, 3);

function renderMap(
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
    const fn = map[i] > 9 ? chalk.rgb(0, 192, 0) : chalk;

    cols.push(fn((pad + map[i].toString()).slice(-maxDigits - 1)));
  }
  final.push(' ' + cols.join(' '));
  return final.join('\n') + chalk.reset(); //.slice(1);
}

function getSurroundingPositions(pos: number, rowsize: number): number[] {
  const res = [];

  let xLeft = -1,
    xRight = 1;
  let yTop = -rowsize,
    yBottom = rowsize;

  // we're on the left "edge" of the 2x2 grid
  // don't add positions to the left of us
  if (pos % 10 === 0) {
    xLeft = 0;
  }
  // we're on the right "edge"; don't add positions to the right of us
  if (pos % 10 === rowsize - 1) {
    xRight = 0;
  }

  // position 0-9 when rowsize 10: top row, don't
  // add positions above us
  if (pos < rowsize) {
    yTop = 0;
  }
  // we're assuming an NxN grid; if not, we'll need to
  // pass in the total size of the state array, or
  // refactor into a class.
  // position (rowsize*rowsize)-rowsize and upward
  // is the bottom row. e.g. (10*10)-10 -> 90
  // when in bottom row, don't add positions below us
  if (pos > rowsize * rowsize - rowsize - 1) {
    yBottom = 0;
  }

  for (let xOff = xLeft; xOff <= xRight; xOff++) {
    for (let yOff = yTop; yOff <= yBottom; yOff += rowsize) {
      const n = pos + xOff + yOff;
      // don't add "self" to the list
      if (pos === n) {
        continue;
      }
      res.push(n);
    }
  }
  return res;
}

function tick(energy: number[], rowsize: number): boolean {
  const flashes: number[] = [];
  let numFlashes = 0;
  tick1(render());
  for (let i = 0; i < energy.length; i++) {
    energy[i]++;
    // checking === 10, not > 9 -- we only flash _once_ per tick.
    // if we checked > 9, we would flash when we went from 9 to 10,
    // and 10 to 11, and so on.
    if (energy[i] === 10) {
      // record octopuses that have "flashed", so that we can
      // energize the surrounding octopuses
      flashes.push(i);
    }
  }

  // for each octopus that flashes, "energize" the surrounding octopuses
  // this is the cardinal directions and also the diagonals
  while (flashes.length > 0) {
    // count this flash
    numFlashes++;

    // calculate the surrounding octopus positions
    const idx = flashes.pop();

    const positions = getSurroundingPositions(idx, rowsize);

    // increment the energy of all 8 surrounding octopuses (except
    // any that got filtered out for being out of bounds)
    for (const i of positions) {
      energy[i]++;
      if (energy[i] === 10) {
        flashes.push(i);
      }
    }
  }
  tick2(render());

  // reset every octopus that has flashed to an energy level of 0
  for (let i = 0; i < energy.length; i++) {
    if (energy[i] > 9) {
      energy[i] = 0;
    }
  }
  tick3(render());

  return numFlashes === energy.length;
}

let step = 0,
  synchronized = false;
while (synchronized === false) {
  synchronized = tick(energy, rowsize);
  step++;
}

console.log(step);
