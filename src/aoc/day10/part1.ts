import { readLines } from '../lib/util';

const lines = readLines(__dirname, 'input.txt');

const pairs: { [key: string]: string } = {
  '(': ')',
  '[': ']',
  '{': '}',
  '<': '>',
};
const scores: { [key: string]: number } = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137,
};

function score(line: string): number {
  const expect: string[] = [];

  for (const chr of line) {
    if (Object.hasOwnProperty.call(pairs, chr)) {
      expect.push(pairs[chr]);
    } else if (expect[expect.length - 1] === chr) {
      expect.pop();
    } else {
      return scores[chr];
    }
  }

  return 0;
}

const result = lines.map(score).reduce((a, b) => a + b);
console.log(result);
