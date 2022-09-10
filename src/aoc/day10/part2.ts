import { readLines } from '../lib/util';

const lines = readLines(__dirname, 'input.txt');

const pairs: { [key: string]: string } = {
  '(': ')',
  '[': ']',
  '{': '}',
  '<': '>',
};
const scores: { [key: string]: number } = {
  ')': 1,
  ']': 2,
  '}': 3,
  '>': 4,
};

function score(line: string): number[] {
  const expect: string[] = [];
  let score = 0;

  // accumulate the current "unclosed chunks"
  // abort early if an _invalid_ closing bracket
  // is encountered. otherwise, return the autocomplete score
  for (const chr of line) {
    if (Object.hasOwnProperty.call(pairs, chr)) {
      expect.push(pairs[chr]);
    } else if (expect[expect.length - 1] === chr) {
      expect.pop();
    } else {
      // return an empty array for invalid lines
      return [];
    }
  }

  // tally score
  while (expect.length) {
    score *= 5;
    score += scores[expect.pop()];
  }

  // return an array of one: the score, for a valid line
  return [score];
}

const result = lines.flatMap(score);
result.sort((a, b) => a - b);

console.log(result[Math.floor(result.length / 2)]);
