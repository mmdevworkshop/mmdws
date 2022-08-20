import { readLines } from "../lib/util";

const values = readLines(__dirname, "input.txt").map((v) => parseInt(v, 2));

function findValue(
  vals: number[],
  callback: (ones: number, zeroes: number) => number
) {
  // if largestValue is 100101
  // bitPos is 5
  // 1 << bitPos is     100000

  const largestValue = values.reduce((a, b) => Math.max(a, b));
  const leftMostBitPos = Math.floor(Math.log(largestValue) / Math.log(2));

  // loop from bitPos = 10000 through 01000 all the way to 00001
  for (let bitPos = leftMostBitPos; bitPos >= 0; bitPos--) {
    // count ones and zeroes at bitPos
    let ones = 0;
    let zeroes = 0;
    for (let v of vals) {
      const mask = 1 << bitPos;
      if ((v & mask) === 0) {
        zeroes++;
      } else {
        ones++;
      }
    }

    // determine what we're looking for at this position (let the caller tell us, based on the counts)
    const desiredBit = callback(ones, zeroes);

    // filter values by checking the value of the bit at this position
    vals = vals.filter((v) => ((v >> bitPos) & 1) === desiredBit);
    if (vals.length === 1) {
      break;
    }
  }

  if (vals.length === 0) {
    throw new Error("expected exactly one result");
  }
  return vals[0];
}

const oxygenRating = findValue(values, (ones, zeroes) =>
  ones > zeroes ? 1 : zeroes > ones ? 0 : 1
);
const co2ScrubberRating = findValue(values, (ones, zeroes) =>
  ones < zeroes ? 1 : zeroes < ones ? 0 : 0
);

console.log({ oxygenRating, co2ScrubberRating });
console.log("life support rating", oxygenRating * co2ScrubberRating);
