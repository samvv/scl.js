
import AVLTreeIndex from "../AVLTreeIndex";
import DoubleLinkedList from "../DoubleLinkedList";
import HashDict from "../HashDict";
import HashMultiDict from "../HashMultiDict";
import PriorityQueue from "../PriorityQueue";
import Queue from "../Queue";
import RBTreeIndex from "../RBTreeIndex";
import SingleLinkedList from "../SingleLinkedList";
import Stack from "../Stack";
import TreeDict from "../TreeDict";
import TreeMultiDict from "../TreeMultiDict";
import Vector from "../Vector";
import { RBTreeDict } from "../RBTreeDict";
import RBTreeMultiDict from "../RBTreeMultiDict";

type Newable<T> = { new (...args: any[]): T; }

interface Type {
  name: string;
  implements: string[];
  classConstructor?: Newable<any>;
}

const TYPE_NAMES: Type[] = [
  {
    name: 'Collection',
    implements: []
  },
  {
    name: 'SortedIndex',
    implements: ['Index'],
  },
  {
    name: 'SortedMultiIndex',
    implements: ['SortedIndex'],
  },
  {
    name: 'Sequence',
    implements: ['Collection']
  },
  {
    name: 'Index',
    implements: ['Collection'],
  },
  {
    name: 'DictLike',
    implements: []
  },
  {
    name: 'Dict',
    implements: ['DictLike']
  },
  {
    name: 'ManyDict',
    implements: ['DictLike']
  },
  {
    name: 'MultiDict',
    implements: ['DictLike']
  },
  {
    name: 'QueueLike',
    implements: ['Collection']
  },
  {
    name: 'SingleLinkedList',
    implements: ['Sequence'],
    classConstructor: SingleLinkedList
  },
  {
    name: 'DoubleLinkedList',
    implements: ['Sequence'],
    classConstructor: DoubleLinkedList
  },
  {
    name: 'Stack',
    implements: ['QueueLike'],
    classConstructor: Stack
  },
  {
    name: 'PriorityQueue',
    implements: ['QueueLike'],
    classConstructor: PriorityQueue
  },
  {
    name: 'Queue',
    implements: ['QueueLike'],
    classConstructor: Queue
  },
  {
    name: 'Vector',
    implements: ['Sequence'],
    classConstructor: Vector,
  },
  {
    name: 'RBTreeIndex',
    implements: ['SortedIndex'],
    classConstructor: RBTreeIndex,
  },
  {
    name: 'AVLTreeIndex',
    implements: ['SortedIndex'],
    classConstructor: AVLTreeIndex,
  },
  {
    name: 'HashDict',
    implements: ['Dict'],
    classConstructor: HashDict,
  },
  {
    name: 'HashMultiDict',
    implements: ['MultiDict'],
    classConstructor: HashMultiDict,
  },
  {
    name: 'TreeDict',
    implements: ['Dict'],
    classConstructor: TreeDict,
  },
  {
    name: 'TreeMultiDict',
    implements: ['MultiDict'],
    classConstructor: TreeMultiDict
  },
  {
    name: 'RBTreeDict',
    implements: ['Dict'],
    classConstructor: RBTreeDict,
  },
  {
    name: 'RBTreeMultiDict',
    implements: ['MultiDict'],
    classConstructor: RBTreeMultiDict
  },
]

interface Test {
  hasNew: boolean;
  classConstructorName: string;
  methodName: string;
  description: string;
  title: string;
  execute: (collection?: any) => void;
  willExecute: boolean;
}

const tests: Test[] = [];

function addTest(test: Test, type: Type) {
  test.willExecute = true;
  it(`${type.name}.${test.methodName} ${test.description}`, () => {
    if (test.hasNew) {
      test.execute(type.classConstructor);
    } else {
      const Class = type.classConstructor!;
      const instance = new Class();
      test.execute(instance);
    }
  })
}

function isImplementationOf(derived: string, base: string): boolean {
  const type = TYPE_NAMES.find(type => type.name === derived);
  if (type === undefined) {
    throw new Error(`Could not find definition of ${derived}`);
  }
  if (type.name === base) {
    return true;
  }
  return type.implements.some(parent => isImplementationOf(parent, base));
}

before(() => {
  for (const type of TYPE_NAMES) {
    if (type.classConstructor === undefined) {
      continue;
    }
    describe(type.name, () => {
      for (const test of tests) {
        if (isImplementationOf(type.name, test.classConstructorName)){ 
          addTest(test, type);
        }
      }
    });
  }
  for (const test of tests) {
    if (!test.willExecute) {
      throw new Error(`The test titled ${test.title} will never execute.`)
    }
  }
});

function parseTestTitle(title: string): [boolean, string, string, string] {
  let k = 0;
  let hasNew = false;
  if (title.startsWith('new ')) {
    hasNew = true;
    k = 4;
  }
  for (let i = k; i < title.length; i++) {
    const ch = title[i];
    if (!/^[a-zA-Z]$/.test(ch)) {
      for (let j = i; j < title.length; j++) {
        if (title[j] === " ") {
          const methodName = title.substring(i+1, j);
          const description = title.substring(j+1);
          const classConstructorName = title.substring(k, i);
          return [hasNew, classConstructorName, methodName, description];
        }
      }
      throw new Error(`Property name must be followed by '()' or a space and a description.`);
    }
  }
  throw new Error(`Class name must be followed by a property name and a description.`);
}

export function test<C>(title: string, execute: (collection: C) => void) {
  const [hasNew, classConstructorName, methodName, description] = parseTestTitle(title);
  tests.push({
    hasNew,
    classConstructorName,
    methodName,
    description,
    title,
    execute,
    willExecute: false,
  })
}
