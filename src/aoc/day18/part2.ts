import { readLines } from '../lib/util';

import { Node } from './part1';

const ns = readLines(__dirname, 'input.txt');

let greatest = 0;
for (let i = 0; i < ns.length; i++) {
  for (let j = 0; j < ns.length; j++) {
    greatest = Math.max(greatest, Node.from(ns[i]).add(ns[j]).magnitude());
  }
}

console.log(greatest);
