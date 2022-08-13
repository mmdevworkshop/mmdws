import { readLinesAsInts } from "../lib/util";

const depths = readLinesAsInts(__dirname, "./input.txt");

if (!depths || depths.length < 1) {
  throw new Error("Bad input");
}

// depths has at least one value, otherwise the program would crash before it gets here
let previousValue: number | undefined;
let numDepthIncreases: number = 0;
for (let value of depths) {
  if (previousValue === undefined) {
    previousValue = value;
  } else {
    if (value > previousValue) {
      // numDepthIncreases = numDepthIncreases + 1;
      numDepthIncreases++;
    }
    previousValue = value;
  }
}

console.log("Total number of depth increases:", numDepthIncreases);
