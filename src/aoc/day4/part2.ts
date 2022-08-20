import { strictEqual } from 'node:assert/strict';
import { readLines } from '../lib/util';

class Bingo {
  private rows: number[];
  private cols: number[];
  private unmarked: Set<number>;
  private map: Map<number, { row: number; col: number }>;

  readonly size: number;

  constructor(board: number[][], size: number = 5) {
    this.rows = new Array(size).fill(0);
    this.cols = new Array(size).fill(0);
    this.unmarked = new Set();
    this.map = new Map();
    this.size = size;

    strictEqual(
      board.length,
      size,
      `board has board.length=${board.length} rows, but expected size=${size}`
    );
    for (let row = 0; row < board.length; row++) {
      const rowVals = board[row];
      strictEqual(
        rowVals.length,
        size,
        `row has rowVals.length=${rowVals.length} columns, but expected size=${size}`
      );
      for (let col = 0; col < rowVals.length; col++) {
        const val = rowVals[col];

        this.unmarked.add(val);
        this.map.set(val, { row, col });
      }
    }
  }

  record(val: number): boolean {
    if (!this.map.has(val)) {
      return false;
    }

    this.unmarked.delete(val);
    const { row, col } = this.map.get(val);

    this.rows[row]++;
    this.cols[col]++;

    return this.rows[row] === this.size || this.cols[col] === this.size;
  }

  score(): number {
    return [...this.unmarked.values()].reduce((a, b) => a + b);
  }
}

const lines = readLines(__dirname, 'input.txt');

// making a lot of assumptions here -- not validating any of them
const firstLine = lines.splice(0, 1);

const calls = firstLine[0]
  .trim()
  .split(',')
  .map((v) => parseInt(v, 10));

let boards = [];
while (lines.length > 0) {
  const board = lines.splice(0, 5).map((row) =>
    row
      .trim()
      .split(/\s+/)
      .map((v) => parseInt(v, 10))
  );

  boards.push(new Bingo(board, 5));
}

outer: for (const call of calls) {
  if (boards.length > 1) {
    boards = boards.filter((board) => !board.record(call));
    // could go from >1 remaining to 0 remaining -- assuming it won't happen given the data
  } else if (boards.length === 1) {
    const board = boards[0];
    if (board.record(call)) {
      console.log(
        '*last* winning board has score',
        board.score(),
        'on call',
        call,
        'result',
        board.score() * call
      );
      break outer;
    }
  } else {
    // the data AOC gives us won't get us here, but our code doesn't prevent it or deal with
    // it gracefully
    throw new Error('unhandled state');
  }
}
