import { difference, intersection, isSuperset } from '../lib/setops';
import { readLines } from '../lib/util';

function splitSort(sequence: string): string[] {
  return sequence.split(' ').map((v) => {
    let chunked = v.split('');
    chunked.sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));
    return chunked.join('');
  });
}

const lines = readLines(__dirname, 'input.txt').map((line) => {
  const split = line.split(' | ');
  const left = splitSort(split[0]);
  const value = splitSort(split[1]);
  const samples = new Set<string>(left.concat(value));

  return {
    samples,
    value,
  };
});

const digitsToSegments: Map<number, Set<string>> = new Map([
  [0, new Set('ABCEFG'.split(''))],
  [1, new Set('CF'.split(''))],
  [2, new Set('ACDEG'.split(''))],
  [3, new Set('ACDFG'.split(''))],
  [4, new Set('BCDF'.split(''))],
  [5, new Set('ABDFG'.split(''))],
  [6, new Set('ABDEFG'.split(''))],
  [7, new Set('ACF'.split(''))],
  [8, new Set('ABCDEFG'.split(''))],
  [9, new Set('ABCDFG'.split(''))],
]);

function solve({
  samples,
  value,
}: {
  samples: Set<string>;
  value: string[];
}): number {
  const [inputSegments, outputSegments] = (() => {
    const knownValues = [...digitsToSegments.values()].flatMap((set) => [
      ...set.values(),
    ]);
    return [
      new Set(knownValues.map((v) => v.toLowerCase())),
      new Set(knownValues),
    ];
  })();

  const mappings: [Set<string>, Set<string>][] = [
    [new Set(inputSegments), new Set(outputSegments)],
  ];

  const numSegmentsToDigits: Map<number, Set<number>> = new Map();
  for (const [digit, segments] of digitsToSegments.entries()) {
    if (!numSegmentsToDigits.has(segments.size)) {
      numSegmentsToDigits.set(segments.size, new Set());
    }
    numSegmentsToDigits.get(segments.size).add(digit);
  }

  const lookup: Map<string, number> = new Map();

  // repeat:
  while (samples.size) {
    // try to identify digits
    for (const sample of [...samples.values()]) {
      const sampleSegments = new Set(sample.split(''));

      const possibleDigits = [
        ...numSegmentsToDigits.get(sample.length).values(),
      ].filter((digit) => {
        const digitSegments = digitsToSegments.get(digit);
        // for a given possible digit, we know what its output segments are; check if
        // the segments in this sample can contain all the output segments for this digit

        for (const [inputSegments, outputSegments] of mappings.values()) {
          // for an input->output pair, if this sample's inputs contain this pair's inputs...
          if (isSuperset(sampleSegments, inputSegments)) {
            // then this pair's _outputs_ can tell us whether this sample can be a given digit
            if (!isSuperset(digitSegments, outputSegments)) {
              return false;
            }
          }
        }

        return true;
      });

      if (possibleDigits.length === 1) {
        const digit = possibleDigits[0];
        samples.delete(sample);
        lookup.set(sample, digit);
      }
    }

    // for each known digit, see if it can be used to subdivide the existing mappings.
    for (const [sample, digit] of lookup.entries()) {
      // 8 never gives us information
      if (digit === 8) {
        continue;
      }

      const digitInputSegments = new Set(sample.split(''));
      const digitOutputSegments = new Set(digitsToSegments.get(digit));

      // loop in reverse so we can splice in replacements later without
      // getting out of sync in our loop
      const possibleSubdivisions = [];
      for (let i = mappings.length - 1; i >= 0; i--) {
        const [inputSegments, outputSegments] = mappings[i];

        // if the known digit completely contains a mapping, remove
        // the input/output segments from that digit's working set
        if (isSuperset(digitOutputSegments, outputSegments)) {
          // this "chunk" of physical segments is wholly a part of this digit
          for (const value of outputSegments) {
            digitOutputSegments.delete(value);
          }
          for (const value of inputSegments) {
            digitInputSegments.delete(value);
          }
        } else {
          possibleSubdivisions.push(i);
        }
      }

      // if there are no remaining segments, we can't derive
      // any new information
      if (digitInputSegments.size === 0) {
        continue;
      }

      // here, "digitInputSegments" and "digitOutputSegments" are the remaining segments
      // that may partially overlap or be completely contained by the remaining mapping values.

      // idx should implicitly be in descending order because of the reverse loop above
      for (const idx of possibleSubdivisions) {
        // for every remaining mapping, check if the remaining segments
        // in the digit are completely contained by that mapping. if so,
        // split it

        const [inputSegments, outputSegments] = mappings[idx];

        if (inputSegments.size === digitInputSegments.size) {
          continue;
        }

        if (isSuperset(inputSegments, digitInputSegments)) {
          const left = [
            intersection(inputSegments, digitInputSegments),
            intersection(outputSegments, digitOutputSegments),
          ] as [Set<string>, Set<string>];

          const right = [
            difference(inputSegments, digitInputSegments),
            difference(outputSegments, digitOutputSegments),
          ] as [Set<string>, Set<string>];

          mappings.splice(idx, 1, left, right);
        }
      }
    }
  }

  return parseInt(value.map((v) => lookup.get(v)).join(''), 10);
}

console.log(lines.reduce((acc, cur) => acc + solve(cur), 0));
