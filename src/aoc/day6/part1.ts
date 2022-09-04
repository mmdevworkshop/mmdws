import { readLines } from '../lib/util';

const numberOfDays = parseInt(process.argv[2], 10);
if (isNaN(numberOfDays) || numberOfDays < 1) {
  console.error(`Usage: node ${process.argv[1]} <number of days>`);
  process.exit(1);
}

const fishies = readLines(__dirname, 'input.txt')[0]
  .split(',')
  .map((v) => parseInt(v, 10));

const afterSpawnCooldown = 6;
const afterBirthCooldown = afterSpawnCooldown + 2;
const divisor = afterBirthCooldown + 1;

// create an array of "number of fish with this many days left until spawn"
const fishTracker = new Array(divisor).fill(0);

for (const fish of fishies) {
  // fish has a value of 3? increment the number of fish at the position "day 3"
  // in fishTracker
  fishTracker[fish]++;
}

// start at <new fish spawn duration>
// each iteration:

for (let currentDay = 0; currentDay < numberOfDays; currentDay++) {
  // add <current value - 1 mod length> to <current value - 3 mod length>
  // where n - v mod length is actually (n - v + length) mod length

  fishTracker[(currentDay - 2 + divisor) % divisor] +=
    fishTracker[(currentDay + divisor) % divisor];
}

const totalFish = fishTracker.reduce((a, b) => a + b);
console.log(totalFish);
