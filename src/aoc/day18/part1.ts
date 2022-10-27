import * as assert from 'node:assert';
import { readLines } from '../lib/util';

const enum NodeType {
  leaf = 'leaf',
  branch = 'branch',
}

type NodeDepth = {
  depth: number;
  node: Node;
};

export class Node {
  private left: Node | null;
  private right: Node | null;
  private value: number | null;
  private type: NodeType;
  private parent: Node | null;

  constructor(value: [Node, Node] | number) {
    this.parent = null;
    if (typeof value === 'number') {
      this.value = value;
      this.left = null;
      this.right = null;
      this.type = NodeType.leaf;
    } else {
      this.value = null;
      this._left(value[0]);
      this._right(value[1]);
      this.type = NodeType.branch;
    }
  }

  private _left(node: Node) {
    this.left = node;
    node.parent = this;
  }

  private _right(node: Node) {
    this.right = node;
    node.parent = this;
  }

  split() {
    assert.strictEqual(this.type, NodeType.leaf);
    this._left(new Node(Math.floor(this.value / 2)));
    this._right(new Node(Math.ceil(this.value / 2)));
    this.value = null;
    this.type = NodeType.branch;
  }

  explode() {
    assert.strictEqual(this.type, NodeType.branch);

    const lefter = this.find('left');
    if (lefter !== null) {
      lefter.value += this.left.value;
    }

    const righter = this.find('right');
    if (righter !== null) {
      righter.value += this.right.value;
    }

    this.left = null;
    this.right = null;
    this.value = 0;
    this.type = NodeType.leaf;
  }

  find(dir: 'left' | 'right'): Node | null {
    const up = dir;
    const down = dir === 'left' ? 'right' : 'left';

    let last: Node = this;
    let current: Node = this.parent;
    // go up until we can go down again
    while (current && current[up] === last) {
      last = current;
      current = current.parent;
    }
    if (current === null) {
      // nothing left of here
      return null;
    }
    assert.strictEqual(current.type, NodeType.branch);

    // "up" is a bad name, but "current" here is the first parent node
    // for which we are not the "rightmost" node when looking for a number
    // "to the right" of us; in order to begin our path back down, we need
    // to "switch" from left to right (or right to left if searching the
    // other direction)...
    current = current[up];
    // go back down the rightmost path until we find a leaf
    while (current.type === NodeType.branch) {
      current = current[down];
    }

    assert.strictEqual(current.type, NodeType.leaf);
    return current;
  }

  _reduce(cb: (nd: NodeDepth) => boolean): boolean {
    let queue: NodeDepth[] = [{ depth: 0, node: this }];

    while (queue.length) {
      const next = queue.pop();
      if (next.node.type === NodeType.branch) {
        queue.push(
          {
            depth: next.depth + 1,
            node: next.node.right,
          },
          {
            depth: next.depth + 1,
            node: next.node.left,
          }
        );
      }
      if (cb(next)) {
        return true;
      }
    }
    return false;
  }

  reduce() {
    let more = true;
    let self = this;
    while (more) {
      more = self._reduce(nd => {
        if (nd.node.type === NodeType.branch && nd.depth >= 4) {
          nd.node.explode();
          return true;
        }
        return false;
      });
      if (more) continue;
      more = self._reduce(nd => {
        if (nd.node.value > 9) {
          assert.strictEqual(nd.node.type, NodeType.leaf);
          nd.node.split();
          return true;
        }
        return false;
      });
    }
  }

  static from(v: string | any): Node {
    if (v instanceof Node) {
      return v;
    }
    const parsed = typeof v === 'string' ? JSON.parse(v) : v;

    if (typeof parsed === 'number') {
      return new Node(parsed);
    } else if (Array.isArray(parsed) && parsed.length === 2) {
      return new Node([Node.from(parsed[0]), Node.from(parsed[1])]);
    } else {
      throw new Error('Invalid data?');
    }
  }

  add(other: string | Node): Node {
    const node = new Node([this, Node.from(other)]);
    node.reduce();
    return node;
  }

  toString(): string {
    if (this.type === NodeType.leaf) {
      return this.value.toString();
    } else {
      return `[${this.left.toString()},${this.right.toString()}]`;
    }
  }

  magnitude(): number {
    if (this.type === NodeType.leaf) {
      return this.value;
    } else {
      return 3 * this.left.magnitude() + 2 * this.right.magnitude();
    }
  }
}

const sum = readLines(__dirname, 'input.txt')
  .map(v => Node.from(v))
  .reduce((acc, cur) => acc.add(cur));

if (require.main === module) {
  console.log(sum.toString());
  console.log(sum.magnitude());
}
