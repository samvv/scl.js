
import { Collection } from "../interfaces"
import { expect } from "chai"

// import TreeMultiDict from "../dict/multi/tree"
// import HashMultiDict from "../dict/multi/hash"
// import TreeManyDict from "../dict/many/tree"
// import HashManyDict from "../dict/many/hash"
// import TreeDict from "../dict/tree"
// import HashDict from "../dict/hash"
// import Queue from "../queue"
// import Stack from "../stack"
// import PriorityQueue from "../priority-queue"
// import SingleLinkedList from "../list/single"
// import DoubleLinkedList from "../list/double"
// import Vector from "../vector"

const TEST_FILES = [
  {
    name: 'TreeMultiDict',
    file: '../dict/multi/tree',
    implements: ['MultiDict', 'DictLike', 'IndexedCollection', 'CollectionLike'],
  },
  {
    name: 'HashMultiDict',
    file: '../dict/multi/hash',
    implements: ['MultiDict', 'DictLike', 'IndexedCollection', 'CollectionLike'],
  },
  {
    name: 'TreeManyDict',
    file: '../dict/many/tree',
    implements: ['ManyDict', 'DictLike', 'IndexedCollection', 'CollectionLike'],
  },
  {
    name: 'HashManyDict',
    file: '../dict/many/hash',
    implements: ['ManyDict', 'DictLike', 'IndexedCollection', 'CollectionLike'],
  },
  {
    name: 'TreeDict',
    file: '../dict/tree',
    implements: ['Dict', 'DictLike', 'IndexedCollection', 'CollectionLike'],
  },
  {
    name: 'HashDict',
    file: '../dict/hash',
    implements: ['Dict', 'DictLike', 'IndexedCollection', 'CollectionLike'],
  },
  {
    name: 'Queue',
    file: '../queue',
    implements: ['Queuelike', 'Collection'],
  },
  {
    name: 'Stack',
    file: '../stack',
    implements: ['Queuelike', 'Collection'],
  },
  {
    name: 'PriorityQueue',
    file: '../priority-queue',
    implements: ['Queuelike', 'Collection'],
  },
  {
    name: 'DoubleLinkedList',
    file: '../list/double',
    implements: ['Sequence', 'List', 'Collection'],
  },
  {
    name: 'SingleLinkedList',
    file: "../list/single",
    implements: ['Sequence', 'List', 'Collection'],
  },
  {
    name: 'Vector',
    file: '../vector',
    implements: ['Sequence', 'Collection'],
  },
]

interface TestOptions {
  args?: Array<any>;
}

for (const testFile of TEST_FILES) {
  describe(testFile.name + '.from()', () => {
    it('successfully creates a collection with the given elements', () => {
      const coll = require(testFile.file).default.from([[1, 2], [2, 3]]);
      expect(coll.size).to.equal(2);
      expect([...coll]).to.deep.include([1, 2]);
      expect([...coll]).to.deep.include([2, 3]);
    });
  });
}

function parseTestName(name: string): [string, string, string] {
  for (let i = 0; i < name.length; i++) {
    const ch = name[i];
    if (!/^[a-zA-Z]$/.test(ch)) {
      for (let j = i; j < name.length; j++) {
        if (name[j] === ' ') {
          const methodName = name.substring(i, j);
          const description = name.substring(j);
          const className = name.substring(0, i);
          return [className, methodName, description];
        }
      }
      throw new Error(`Property name must be followed by '()' or a space and a description.`)
    }
  }
  throw new Error(`Class name must be followed by a property name and a description.`)
}

export function test<C extends Collection<any>>(name: string, callback: (collection: C) => void, opts?: TestOptions) {
  const [className, methodName, description] = parseTestName(name);
  for (const testFile of TEST_FILES) {
    if (testFile.name === className || testFile.implements.some(intfName => intfName === className)) {
      describe(testFile.name + methodName, () => {
        it(description, () => {
          const args = (opts && opts.args) || [];
          callback(require(testFile.file).default.empty(...args) as any);
        })
      })
    }
  }
}

