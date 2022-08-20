import { readLines } from "../lib/util";

const values = readLines(__dirname, "input.txt").map((v) => parseInt(v, 2));

const oneCounts = new Map<number, number>();

for (let v of values) {
  for (let bit = 1; bit <= v; bit = bit << 1) {
    if ((v & bit) !== 0) {
      oneCounts.set(bit, (oneCounts.get(bit) ?? 0) + 1);
    }
  }
}

const middle = values.length / 2;

let gamma = 0;
let epsilon = 0;

for (const [bitValue, count] of oneCounts.entries()) {
  if (count > middle) {
    gamma |= bitValue;
    // epsilon retains a 0 at this position
  } else if (count < middle) {
    // gamma retains a 0 at this position
    epsilon |= bitValue;
  } else {
    throw new Error("count == middle, unspecified behavior");
  }
}

console.log("power consumption", gamma * epsilon);
