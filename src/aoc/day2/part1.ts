import { readLines } from "../lib/util";

interface State {
  hPos: number;
  depth: number;
}

interface Commands {
  [key: string]: (v: number, state: State) => State;
}

const stateFunctions: Commands = {
  forward: (v: number, state: State) =>
    Object.assign(state, { hPos: state.hPos + v }),
  down: (v: number, state: State) =>
    Object.assign(state, { depth: state.depth + v }),
  up: (v: number, state: State) =>
    Object.assign(state, { depth: state.depth - v }),
};

interface Command {
  direction: string;
  value: number;
}

const commands: Command[] = readLines(__dirname, "./input.txt").map((v) => {
  const [direction, value] = v.split(" ");
  return { direction, value: parseInt(value, 10) } as Command;
});

const result = commands.reduce(
  (state: State, cur: Command) =>
    stateFunctions[cur.direction](cur.value, state),
  {
    hPos: 0,
    depth: 0,
  }
);

console.log("Result:", result.hPos * result.depth);
