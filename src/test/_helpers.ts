
import { Collection } from "../interfaces"

import TreeMultiDict from "../dict/multi/tree"
import HashMultiDict from "../dict/multi/hash"
import TreeManyDict from "../dict/many/tree"
import HashManyDict from "../dict/many/hash"
import TreeDict from "../dict/tree"
import HashDict from "../dict/hash"
import Queue from "../queue"
import Stack from "../stack"
import PriorityQueue from "../priority-queue"
import SingleLinkedList from "../list/single"
import DoubleLinkedList from "../list/double"
import Vector from "../vector"

const TEST_FILES = [
  {
    name: 'TreeMultiDict',
    file: '../dict/multi/tree',
    implements: ['MultiDict', 'DictLike', 'KeyedCollection', 'Collection'],
    create: () => new TreeMultiDict<any, any>(),
  },
  {
    name: 'HashMultiDict',
    file: '../dict/multi/hash',
    implements: ['MultiDict', 'DictLike', 'KeyedCollection', 'Collection'],
    create: () => new HashMultiDict<any, any>(),
  },
  {
    name: 'TreeManyDict',
    file: '../dict/many/tree',
    implements: ['ManyDict', 'DictLike', 'KeyedCollection', 'Collection'],
    create: () => new TreeManyDict<any, any>(),
  },
  {
    name: 'HashManyDict',
    file: '../dict/many/hash',
    implements: ['ManyDict', 'DictLike', 'KeyedCollection', 'Collection'],
    create: () => new HashManyDict<any, any>(),
  },
  {
    name: 'TreeDict',
    file: '../dict/tree',
    implements: ['Dict', 'DictLike', 'KeyedCollection', 'Collection'],
    create: () => new TreeDict<any, any>(),
  },
  {
    name: 'HashDict',
    file: '../dict/hash',
    implements: ['Dict', 'DictLike', 'KeyedCollection', 'Collection'],
    create: () => new HashDict<any, any>(),
  },
  {
    name: 'Queue',
    file: '../queue',
    implements: ['Queuelike', 'Collection'],
    create: () => new Queue<any>(),
  },
  {
    name: 'Stack',
    file: '../stack',
    implements: ['Queuelike', 'Collection'],
    create: () => new Stack<any>(),
  },
  {
    name: 'PriorityQueue',
    file: '../priority-queue',
    implements: ['Queuelike', 'Collection'],
    create: () => new PriorityQueue<any>(),
  },
  {
    name: 'DoubleLinkedList',
    file: '../list/double',
    implements: ['Sequence', 'List', 'Collection'],
    create: () => new DoubleLinkedList<any>(),
  },
  {
    name: 'SingleLinkedList',
    file: "../list/single",
    implements: ['Sequence', 'List', 'Collection'],
    create: () => new SingleLinkedList<any>(),
  },
  {
    name: 'Vector',
    file: '../vector',
    implements: ['Sequence', 'Collection'],
    create: () => new Vector<any>(),
  },
]

interface TestOptions {

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
          callback(testFile.create() as any);
        })
      })
    }
  }
}

