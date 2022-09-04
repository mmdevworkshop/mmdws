import { readLines } from '../lib/util';

const lines = readLines(__dirname, 'input.txt').flatMap((v) =>
  v.split(' | ')[1].split(' ')
);

const interesting = new Set<number>([2, 3, 4, 7]);

console.log(lines.filter((v) => interesting.has(v.length)).length);
