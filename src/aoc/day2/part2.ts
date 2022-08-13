import { readLines } from "../lib/util";

interface State {
  hPos: number;
  depth: number;
  aim: number;
}

interface Commands {
  [key: string]: (v: number, state: State) => State;
}

const stateFunctions: Commands = {
  forward: (v: number, { hPos, depth, aim }: State) => ({
    hPos: hPos + v,
    depth: depth + aim * v,
    aim,
  }),
  down: (v: number, { aim, ...obj }: State) => ({
    aim: aim + v,
    ...obj,
  }),
  up: (v: number, { aim, ...obj }: State) => ({
    aim: aim - v,
    ...obj,
  }),
};

interface Command {
  direction: string;
  value: number;
}

const commands: Command[] = readLines(__dirname, "./input.txt").map((v) => {
  const [direction, value] = v.split(" ");
  return { direction, value: parseInt(value, 10) } as Command;
});

// let result: State = {
//     hPos: 0,
//     depth: 0,
//     aim: 0,
// };
// for (const command of commands) {
//     const stateFunction = stateFunctions[command.direction];
//     result = stateFunction(command.value, result);
// }

const result = commands.reduce(
  (state: State, cur: Command) =>
    stateFunctions[cur.direction](cur.value, state),

  {
    hPos: 0,
    depth: 0,
    aim: 0,
  }
);

console.log("Result:", result.hPos * result.depth);
