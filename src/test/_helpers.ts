
import { expect } from "chai";
import AVLTreeIndex from "../AVLTreeIndex";
import { Collection } from "../interfaces";

const TEST_FILES = [
  {
    name: 'AVLTreeIndex',
    file: "../AVLTreeIndex",
    implements: ["IndexedCollection", "CollectionLike"],
    factory: (elements?: any[]) => new AVLTreeIndex({
      elements,
      getKey: element => element,
      allowDuplicates: true
    })
  },
  {
    name: "TreeMultiDict",
    file: "../TreeMultiDict",
    implements: ["MultiDict", "DictLike", "IndexedCollection", "CollectionLike"],
  },
  {
    name: "HashMultiDict",
    file: "../HashMultiDict",
    implements: ["MultiDict", "DictLike", "IndexedCollection", "CollectionLike"],
  },
  {
    name: "TreeManyDict",
    file: "../TreeManyDict",
    implements: ["ManyDict", "DictLike", "IndexedCollection", "CollectionLike"],
  },
  {
    name: "HashManyDict",
    file: "../HashManyDict",
    implements: ["ManyDict", "DictLike", "IndexedCollection", "CollectionLike"],
  },
  {
    name: "TreeDict",
    file: "../TreeDict",
    implements: ["Dict", "DictLike", "IndexedCollection", "CollectionLike"],
  },
  {
    name: "HashDict",
    file: "../HashDict",
    implements: ["Dict", "DictLike", "IndexedCollection", "CollectionLike"],
  },
  {
    name: "Queue",
    file: "../Queue",
    implements: ["Queuelike", "Collection"],
  },
  {
    name: "Stack",
    file: "../Stack",
    implements: ["Queuelike", "Collection"],
  },
  {
    name: "PriorityQueue",
    file: "../PriorityQueue",
    implements: ["Queuelike", "Collection"],
  },
  {
    name: "DoubleLinkedList",
    file: "../DoubleLinkedList",
    implements: ["Sequence", "List", "Collection"],
  },
  {
    name: "SingleLinkedList",
    file: "../SingleLinkedList",
    implements: ["Sequence", "List", "Collection"],
  },
  {
    name: "Vector",
    file: "../Vector",
    implements: ["Sequence", "Collection"],
  },
];

interface TestOptions {
  args?: any[];
}

for (const testFile of TEST_FILES) {
  describe(testFile.name + "()", () => {
    it("successfully creates a collection with the given elements", () => {
      const ctor = require(testFile.file).default;
      const elements = [[1, 2], [2, 3]];
      let coll;
      if (testFile.factory !== undefined) {
        coll = testFile.factory(elements);
      } else {
        coll = new ctor(elements);
      }
      expect(coll.size).to.equal(2);
      const storedElements = [...coll];
      expect(storedElements).to.have.lengthOf(2);
      expect(storedElements).to.deep.include([1, 2]);
      expect(storedElements).to.deep.include([2, 3]);
    });
  });
}

function parseTestName(name: string): [string, string, string] {
  for (let i = 0; i < name.length; i++) {
    const ch = name[i];
    if (!/^[a-zA-Z]$/.test(ch)) {
      for (let j = i; j < name.length; j++) {
        if (name[j] === " ") {
          const methodName = name.substring(i, j);
          const description = name.substring(j);
          const className = name.substring(0, i);
          return [className, methodName, description];
        }
      }
      throw new Error(`Property name must be followed by '()' or a space and a description.`);
    }
  }
  throw new Error(`Class name must be followed by a property name and a description.`);
}

export function test<C extends Collection<any>>(name: string, callback: (collection: C) => void, opts?: TestOptions) {
  const [className, methodName, description] = parseTestName(name);
  for (const testFile of TEST_FILES) {
    if (testFile.name === className || testFile.implements.some((intfName) => intfName === className)) {
      describe(testFile.name + methodName, () => {
        it(description, () => {
          const args = (opts && opts.args) || [];
          const ctor = require(testFile.file).default;
          let coll;
          if (testFile.factory !== undefined) {
            coll = testFile.factory();
          } else {
            coll = new ctor(...args);
          }
          callback(coll);
        });
      });
    }
  }
}
