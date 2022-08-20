import { readLines } from "../lib/util";

function solve(file: string, size: number) {
  const values = readLines(__dirname, file);

  let gamma: string = "";
  let epsilon: string = "";

  // size = 5, starts at 0 and ends at 4
  for (let i = 0; i < size; i++) {
    let zeroes = 0;
    let ones = 0;

    for (const val of values) {
      // val = 'abcde'
      // val[0] === 'a'
      // val[4] === 'e'
      if (val[i] === "0") {
        zeroes++;
      } else if (val[i] === "1") {
        ones++;
      } else {
        throw new Error("unexpected case");
      }
    }

    if (ones > zeroes) {
      gamma += "1";
      epsilon += "0";
    } else if (zeroes > ones) {
      gamma += "0";
      epsilon += "1";
    } else {
      throw new Error("unexpected case");
    }
  }

  // console.log({
  //   file,
  //   gamma,
  //   epsilon,
  //   powerConsumption: parseInt(gamma, 2) * parseInt(epsilon, 2),
  // });
  console.log(
    file,
    "power consumption",
    parseInt(gamma, 2) * parseInt(epsilon, 2)
  );
}

// solve("example.txt", 5);
solve("input.txt", 12);
