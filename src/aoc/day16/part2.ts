import { inspect } from 'node:util';
import { readLines } from '../lib/util';

const exampleData = readLines(__dirname, 'example2.txt')
  .map((v) => v.split(' '))
  .map(([data, expected]) => ({ data, expected }));

const inputData = readLines(__dirname, 'input.txt')[0];

type Operator = (vals: bigint[]) => bigint;
const ops: Record<number, Operator> = {
  /* sum     */ 0: (vals) => vals.reduce((a, b) => a + b),
  /* product */ 1: (vals) => vals.reduce((a, b) => a * b),
  /* minimum */ 2: (vals) => vals.reduce((a, b) => (a < b ? a : b)),
  /* maximum */ 3: (vals) => vals.reduce((a, b) => (a > b ? a : b)),
  /* literal    4: not an operator */
  /* greater */ 5: ([lhs, rhs]) => (lhs > rhs ? 1n : 0n),
  /* less    */ 6: ([lhs, rhs]) => (lhs < rhs ? 1n : 0n),
  /* equal   */ 7: ([lhs, rhs]) => (lhs == rhs ? 1n : 0n),
};

const opNames: Record<number, String> = {
  0: 'sum',
  1: 'product',
  2: 'minimum',
  3: 'maximum',
  4: 'literal',
  5: 'greater',
  6: 'less',
  7: 'equal',
};

const evaluate = (hex: string): number => {
  const buf = Buffer.concat([
    Buffer.from(hex, 'hex'),
    Buffer.from([0, 0, 0]), //padding
  ]);
  let bitpos = 0;

  // "worst case": read num=15 bits starting at bit pos=7
  // xxxxxxxB BBBBBBBB BBBBBBxx xxxxxxxx
  // shift to the right: 32-(num+pos) = 10
  // mask to only "num" bits: (1<<num)-1 = 32767

  // "best case": read 1 bit starting at bit 0
  // Bxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx
  // shift to the right: 32-(1+0) = 31
  // mask to only "num" bits: (1<<1)-1 = 1
  const _read = (num: number): number => {
    // find the first byte that contains at least one bit we care about
    // and read that byte and the three that follow it, maintaining
    // left-to-right ordering of the bits
    // bitpos >> 3 is equivalent to Math.floor(bitpos/8)
    const raw = buf.readUInt32BE(bitpos >> 3);
    // find how many bits to shift the raw input to align the
    // "last bit" that we care about to the right of the 4-byte value
    // this is equivalent to:
    // 32 - (size of number of bits we want + offset into the 4-bytes)
    // example:
    // < 4 ><  8   >< 4 ><      16       >
    // xxxxBBBB BBBBxxxx xxxxxxxx xxxxxxxx
    // we want to shift by 20 and cut off 4
    // 32 - (4 + 8) = 20
    // our "bitpos" value, though, is the bit position into the entire
    // sequence, so it could be any arbitrary value. we only care about
    // its position in the 4-byte range we are working within. example:
    // bitpos = 12
    // <   8   >< 4 ><  8   >< 4 ><      16       >
    // xxxxxxxx[xxxxBBBB BBBBxxxx xxxxxxxx xxxxxxxx]
    // we want to apply the previous math as though bitpos was "4", so
    // we need to "wrap" bitpos into the 0-7 value range. this is because
    // the first byte ALWAYS has a bit we care about within it, due to
    // our calculation above. so, we want bitpos % 8 or, equivalently:
    // bitpos & 0b00000111
    const shift = 32 - num - (bitpos & 0b00000111);
    const mask = (1 << num) - 1;

    bitpos += num;
    const res = (raw >> shift) & mask;
    return res;
  };

  const _version = (): number => _read(3);

  const _literal = (): bigint => {
    let val = 0n;
    while (_read(1) === 1) {
      val = (val << 4n) + BigInt(_read(4));
    }
    const res = (val << 4n) + BigInt(_read(4));
    return res;
  };

  const _subpackets_bits = (numBits: number): bigint[] => {
    let upTo = bitpos + numBits;
    const packets: bigint[] = [];
    while (bitpos < upTo) {
      packets.push(_packet());
    }
    return packets;
  };

  const _subpackets_count = (numPackets: number): bigint[] => {
    let upTo = numPackets;
    const packets: bigint[] = [];
    for (let count = 0; count < upTo; count++) {
      packets.push(_packet());
    }
    return packets;
  };

  const _subpackets = (): bigint[] => {
    const mode = _read(1);
    switch (mode) {
      case 0:
        return _subpackets_bits(_read(15));
      case 1:
        return _subpackets_count(_read(11));
    }
    throw new Error('impossible?');
  };

  const _packet = (): bigint => {
    // version is no longer used, but must read to advance the pointer
    const version = _version();
    const type = _read(3);

    let res: bigint;
    let args: bigint[] = [];
    if (type === 4) {
      res = _literal();
    } else {
      args = _subpackets();
      res = ops[type](args);
    }
    console.log(opNames[type], args, res);
    return res;
  };

  return Number(_packet());
};

// for (const example of exampleData) {
//   const val = evaluate(example.data);
//   console.log(val, example.expected);
// }

console.log(evaluate(inputData));
