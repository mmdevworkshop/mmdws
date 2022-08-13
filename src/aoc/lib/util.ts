import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function readLines(...args: string[]): string[] {
  return readFileSync(resolve(...args), "utf-8")
    .split(/\r?\n/)
    .filter((v) => v !== "");
}

export function readLinesAsInts(...args: string[]): number[] {
  return readLines(...args).map((line) => parseInt(line, 10));
}
