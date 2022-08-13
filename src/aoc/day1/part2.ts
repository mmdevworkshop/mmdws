import { readLinesAsInts } from "../lib/util";

const depths = readLinesAsInts(__dirname, "./input.txt");

if (!depths || depths.length < 1) {
  throw new Error("Bad input");
}

function sum(...vals: number[]): number {
  let total: number = 0;
  for (const val of vals) {
    // total = total + val;
    total += val;
  }
  return total;
}

// depths has at least one value, otherwise the program would crash before it gets here
let previousValue: number | undefined;
let numDepthIncreases: number = 0;
for (let i = 0; i < depths.length - 2; i++) {
  const items = depths.slice(i, i + 3);
  const total = sum(...items);

  // console.log('item', i, '=', total);

  if (previousValue === undefined) {
    previousValue = total;
  } else {
    if (total > previousValue) {
      // numDepthIncreases = numDepthIncreases + 1;
      numDepthIncreases++;
    }
    previousValue = total;
  }
}

console.log("Total number of depth increases:", numDepthIncreases);
