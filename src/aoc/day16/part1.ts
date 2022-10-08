import { inspect } from 'node:util';
import { readLines } from '../lib/util';

const exampleData = readLines(__dirname, 'example.txt')
  .map((v) => v.split(' '))
  .map(([data, expected]) => ({ data, expected }));

const inputData = readLines(__dirname, 'input.txt')[0];

type Packet = Literal | Operator;
interface Literal {
  version: number;
  type: 'literal';
  value: number;
}
interface Operator {
  version: number;
  type: 'unknownoperator';
  subpackets: Packet[];
}

const decode = (hex: string, cb?: (p: Packet) => void) => {
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

  const _type = (): Packet['type'] => {
    const t = _read(3);
    switch (t) {
      case 4:
        return 'literal';
      default:
        return 'unknownoperator';
    }
  };

  const _literal = (): number => {
    let val = 0;
    while (_read(1) === 1) {
      val = (val << 4) + _read(4);
    }
    const res = (val << 4) + _read(4);
    return res;
  };

  const _subpackets_bits = (numBits: number): Packet[] => {
    let upTo = bitpos + numBits;
    const packets: Packet[] = [];
    while (bitpos < upTo) {
      packets.push(_packet());
    }
    return packets;
  };

  const _subpackets_count = (numPackets: number): Packet[] => {
    let upTo = numPackets;
    const packets: Packet[] = [];
    for (let count = 0; count < upTo; count++) {
      packets.push(_packet());
    }
    return packets;
  };

  const _subpackets = (): Packet[] => {
    const mode = _read(1);
    switch (mode) {
      case 0:
        return _subpackets_bits(_read(15));
      case 1:
        return _subpackets_count(_read(11));
    }
    throw new Error('impossible?');
  };

  const _packet = (): Packet => {
    const version = _version();
    const type = _type();

    let packet: Packet;
    if (type === 'literal') {
      packet = {
        version,
        type,
        value: _literal(),
      } as Literal;
    } else {
      packet = {
        version,
        type,
        subpackets: _subpackets(),
      } as Operator;
    }
    cb(packet);
    return packet;
  };

  return _packet();
};

// for (const example of exampleData) {
//   let versionSum = 0;
//   decode(example.data, (p) => {
//     versionSum += p.version;
//   });
//   console.log(versionSum, example.expected);
// }

let versionSum = 0;
decode(inputData, (p) => {
  versionSum += p.version;
});
console.log(versionSum);
