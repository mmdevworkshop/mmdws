import { readLines } from '../lib/util';

function filterOneStep(
  values: string[],
  pos: number,
  callback: (zeroes: number, ones: number) => string
): string[] {
  let zeroes = 0;
  let ones = 0;
  for (const val of values) {
    if (val[pos] === '0') {
      zeroes++;
    } else if (val[pos] === '1') {
      ones++;
    } else {
      throw new Error('unexpected case');
    }
  }

  const desiredValue = callback(zeroes, ones);
  return values.filter((val) => val[pos] === desiredValue);
}

function solve(file: string, size: number) {
  let values = readLines(__dirname, file);

  let oxygenValues = values.slice();
  for (let i = 0; i < size; i++) {
    oxygenValues = filterOneStep(oxygenValues, i, (zeroes, ones) =>
      ones > zeroes ? '1' : zeroes > ones ? '0' : '1'
    );
    if (oxygenValues.length === 1) {
      break;
    }
  }
  if (oxygenValues.length !== 1) {
    throw new Error('unexpected case');
  }

  let co2Values = values.slice();
  for (let i = 0; i < size; i++) {
    co2Values = filterOneStep(co2Values, i, (zeroes, ones) =>
      ones < zeroes ? '1' : zeroes < ones ? '0' : '0'
    );
    if (co2Values.length === 1) {
      break;
    }
  }
  if (co2Values.length !== 1) {
    throw new Error('unexpected case');
  }

  console.log(
    file,
    'life support rating',
    parseInt(oxygenValues[0], 2) * parseInt(co2Values[0], 2)
  );
}

solve('example.txt', 5);
solve('input.txt', 12);
