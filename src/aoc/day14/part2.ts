import { readLines } from '../lib/util';

type RuleSet = Record<string, [string, string]>;
const { start, rules } = ((): { start: string; rules: RuleSet } => {
  const rawLines = readLines(__dirname, 'input.txt');

  const start = rawLines.splice(0, 1)[0];
  const rules = rawLines
    .map((v) => v.match(/^(?<pair>[A-Z]{2}) -> (?<insert>[A-Z])$/)) // unpack "AB -> C" into {pair: "AB", insert: "C"}
    .reduce(
      (rules, { groups: { pair, insert } }) =>
        Object.assign(rules, { [pair]: [pair[0] + insert, insert + pair[1]] }),
      Object.create(null) as Record<string, [string, string]>
    ); // turn {pair: "AB", insert: "C"} into ["AB", ["AC", "CB"]]

  return { start, rules };
})();

let state: Record<string, number> = {};
for (let i = 0; i < start.length - 1; i++) {
  const key = start.slice(i, i + 2);
  state[key] = (state[key] ?? 0) + 1;
}

function tick(oldState: Record<string, number>, ruleSet: RuleSet): Record<string, number> {
  const newState: Record<string, number> = Object.create(null);
  for (const [key, val] of Object.entries(oldState)) {
    if (key in ruleSet) {
      const [p1, p2] = ruleSet[key];
      // Have: {AC: 3}
      // Rule: AC -> [AB, BC]
      // Next: {AB: 3, BC: 3}
      newState[p1] = (newState[p1] ?? 0) + val;
      newState[p2] = (newState[p2] ?? 0) + val;
    } else {
      newState[key] = (newState[key] ?? 0) + val;
    }
  }

  return newState;
}

for (let i = 0; i < 40; i++) {
  state = tick(state, rules);
}

const finalChars: Record<string, number> = Object.create(null);
// total up the number of occurrences of each _single_ character
// from our pairs map
// count only the last characters of each pair; otherwise we'd
// double-count. we'll add +1 to the first character of the original
// string to round it out
for (const [key, val] of Object.entries(state)) {
  finalChars[key[1]] = (finalChars[key[1]] ?? 0) + val;
}
finalChars[start[0]] = (finalChars[start[0]] ?? 0) + 1;

let min = Infinity,
  max = -Infinity;
// find the most and least frequent characters
for (const val of Object.values(finalChars)) {
  min = Math.min(min, val);
  max = Math.max(max, val);
}

console.log(max - min);
