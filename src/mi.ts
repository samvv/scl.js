
import { Container, Sequence, UnorderedContainer, Dict, MultiDict, Cursor } from "./interfaces"
import { lesser, equal } from "./util"
import { digest } from "json-hash"

import List from "./list/double"
import HashDict from "./dict/hash"
import HashManyDict from "./dict/many/hash"
import HashMultiDict from "./dict/multi/hash"
import TreeDict from "./dict/tree"
import TreeManyDict from "./dict/many/tree"
import TreeMultiDict from "./dict/multi/tree"
import AVL from "./avl"
import Hash from "./hash"

enum Arity {
  One,
  MultiKey,
  MultiElement,
}

class DirectedList<T> extends List<T> {
  add(el: T) {
    return this.append(el);
  }
}

enum IndexKind {
  List,
  Tree,
  Hash,
}

interface IndexType {
  name: string;
  key: string;
  arity: Arity;
  kind: IndexKind,
  reversed: boolean;
  lesser?: (a, b) => boolean;
  equal?: (a, b) => boolean;
  hash?: (a) => number;
}

function findMatchingType() {
}

function sortArgs(args: any[]) {
  let proc, key;
  if (typeof args[0] === 'function') {
    key = args[1];
    proc = args[0];
  }
  if (typeof args[1] === 'function') {
    key = args[0];
    proc = args[1]
  }
  key = args[0];
  return [key, proc];
}

export class IndexBuilder<T> {

  _indexTypes = [];
  _indexIDNames = Object.create(null);
  _defaultIndex: number = 0;
  
  //_types = Object.create(null);
  _hashers = Object.create(null);
  _equals = Object.create(null);
  _lesser = Object.create(null);

  _getLesser(indexType: IndexType) {
    const lt = indexType.lesser || this._lesser[indexType.key] || lesser;
    if (indexType.key) {
      return (a, b) => lt(a[indexType.key], b[indexType.key]);
    }
    return lt;
  }

  _getEquality(indexType: IndexType) {
    const eq = indexType.equal || this._equals[indexType.key] || equal;
    if (indexType.key) {
      return (a, b) => eq(a[indexType.key], b[indexType.key]);
    }
    return eq;
  }

  _getHasher(indexType: IndexType) {
    const hash = indexType.hash || this._hashers[indexType.key] || digest;
    if (indexType.key) {
      return el => hash(el[indexType.key]);
    }
    return hash;
  }

  _getIndexType(name?: string) {
    if (name === undefined) {
      const newType = { arity: Arity.MultiElement, key: null, sortOrder: 0 };
      this._indexTypes.push(newType);
      return newType;
    }
    if (this._indexIDNames[name] === undefined) {
      const newType = { name, arity: Arity.MultiElement, key: null, sortOrder: 0 };
      this._indexIDNames[name] = this._indexTypes.length;
      this._indexTypes.push(newType);
      return newType;
    }
    return this._indexTypes[this._indexIDNames[name]];
  }

  default(name: string) {
    this._defaultIndex = this._indexIDNames[name];
  }

  sequenced(name: string = '') {
    const type = this._getIndexType(name);
    type.kind = IndexKind.List;
    return this;
  }

  unique(name: string = '') {
    const type = this._getIndexType(name);
    type.arity = Arity.One;
    return this;
  }

  equal<V>(proc: (a: V, b: V) => boolean, key: string = '') {
    this._equals[key] = proc;
    return this;
  }

  lesser(proc, key: string = '') {
    this._lesser[key] = proc;
    return this;
  }

  defaultHash(...args) {
    const [key, hasher] = sortArgs(args);
    this._hashers[key || ''] = hasher || lesser;
    return this;
  }

  hash<V>(...args) {
    const [name, customDigest] = sortArgs(args);
    const type = this._getIndexType(name);
    type.kind = IndexKind.Hash;
    if (customDigest) {
      type.hash = customDigest;
    }
    return this;
  }

  sortedAsc(...args) {
    const [name, customLesser] = sortArgs(args);
    const type = this._getIndexType(name);
    type.reversed = true;
    type.kind = IndexKind.Tree;
    if (customLesser) {
      type.lesser = customLesser;
    }
    return this;
  }

  sortedDesc<V>(...args) {
    const [name, customLesser] = sortArgs(args);
    const type = this._getIndexType(name);
    type.reversed = false;
    type.kind = IndexKind.Tree;
    if (customLesser) {
      type.lesser = customLesser;
    }
    return this;
  }

  //analyse() {
    //for (const indexType of this._indexTypes) {
    //}
  //}

  build() {

    const getCursorIndex = (name: string) => {
      if (name === null) {
        return this._defaultIndex;
      }
      return this._indexIDNames[name];
    }

    const descriptor = new Descriptor<T>();

    const createIndex = (indexType: IndexType, i: number) => {
      
      if (indexType.kind === IndexKind.List) {
        return new SeqIndex<T>(new DirectedList<Element<T>>());
      }

      if (indexType.kind === IndexKind.Hash) {
        const hash = this._getHasher(indexType);
        const equal = this._getEquality(indexType);
        if (!indexType.key) {
          const index = new DictIndex<T>(new HashDict<T, Element<T>>(hash, equal));
          if (!descriptor._fastLookup)
            descriptor._fastLookup = index;
          return index;
        }
        //switch (indexType.arity) {
        //case Arity.One:
            //return new DictIndex<T, any>(new HashDict<any, Element<T>>(el => hash(el.value), (a, b) => equal(a.value, b.value), equalElements));
        //case Arity.MultiKey:
          //const equalValues = indexType.hashValue;
          //return new DictIndex<T, any>(new HashManyDict<any, Element<T>>(el => hash(el.value), (a, b) => equal(a.value, b.value));
        //case Arity.MultiElement:
            //return new DictIndex<T, any>(new HashMultiDict<any, Element<T>>(hash, equal));
        //}
      }

      if (indexType.kind === IndexKind.Tree) {
        const lesser = this._getLesser(indexType);
        if (!indexType.key) {
          return new DictIndex(new TreeDict<T, Element<T>>((a, b) => lesser(a.value, b.value)));
        }
        switch (indexType.arity) {
        case Arity.One:
            return new DictIndex<T>(new TreeDict<any, Element<T>>((a, b) => lesser(a.value, b.value)));
        case Arity.MultiKey:
            return new DictIndex<T>(new TreeMultiDict<any, Element<T>>((a, b) => lesser(a.value, b.value)));
        case Arity.MultiElement:
            return new DictIndex<T>(new TreeMultiDict<any, Element<T>>((a, b) => lesser(a.value, b.value)));
        }
      }

      throw new TypeError(`could not create index from given configuration`);
    }

    for (let i = 0; i < this._indexTypes.length; ++i) {
      const indexType = this._indexTypes[i];
      const index = createIndex(indexType, i);
      index._indexID = i;
      index._descriptor = descriptor;
      descriptor.addIndex(index, indexType.name);
    }

    return descriptor._indices[0];
  }

}

interface NamedSet<T> {
  [key: string]: T;
}

class Descriptor<T> implements Container<T> {

  _indices: Index<T>[] = [];
  _indexNames: NamedSet<number> = Object.create(null);
  _fastLookup: Index<T>;

  addIndex(index: Index<T>, name?: string) {
    const i = this._indices.length;
    this._indices.push(index);
    if (name !== undefined) {
      this._indexNames[name] = i;
    }
  }

  _add(src: Index<T>, val: T) {
    const el = new Element<T>(val);
    const poss = [];
    for (let i = 0; i < this._indices.length; ++i) {
      if (this._indices[i] !== src) {
        const [added, otherCursor] = this._indices[i]._add(el);
        if (!added) {
          for (let j = 0; j < poss.length; ++j) {
            this._indices[j]._deleteAt(poss[j]);
          }
          return [false, poss[0].value];
        }
        el._cursors[i] = otherCursor;
      }
    }
    return [true, el];
  }

  _deleteAt(src: Index<T>, pos: Element<T>) {
    for (let i = 0; i < this._indices.length; ++i) {
      if (this._indices[i] !== src) {
        this._indices[i]._deleteAt(pos._cursors[i].value);
      }
    }
  }

  index(name: number | string) {
    if (typeof name === 'string') 
      name = this._indexNames[name];
    const index = this._indices[name];
    if (index === undefined) {
      throw new RangeError(`index ${name} not found`);
    }
    return index;
  }

  has(val: T) {
    return this._fastLookup.has(val);
  }

  [Symbol.iterator]() {
    return this._indexes[0][Symbol.iterator]();
  }

  add(val: T) {
    const el = new Element<T>(val);
    const poss = [];
    for (let i = 0; i < this._indices.length; ++i) {
      const [added, otherCursor] = this._indices[i]._add(el);
      if (!added) {
        for (let j = 0; j < poss.length; ++j) {
          this._indices[j]._deleteAt(poss[j]);
        }
        return [false, otherCursor];
      }
      el._cursors[i] = otherCursor;
    }
    return [true, el];
  }

  deleteAt(pos: Element<T>) {
    for (let i = 0; i < this._indices.length; ++i) {
      this._indices[i]._deleteAt(pos._cursors[i].value);
    }
  }
  
  clear() {
    for (let i = 0; i < this._indices.length; ++i) {
      this._indices[i]._clear();
    }
  }

}

export class Element<T> implements Cursor<T> {

  _cursors: Cursor<any>[] = [];

  constructor(public value: T) {

  }

  next() {
    const n = this._cursors[0].next();
    if (n !== null) {
      return n.value;
    }
    return null;
  }

  prev() {
    const n = this._cursors[0].prev();
    if (n !== null) {
      return n.value;
    }
    return null;
  }

}

class IndexCursor<T> implements Cursor<T> {

  constructor(public _el: Element<T>, public _cursorIndex: number) {

  }

  get value() {
    return this._el.value;
  }

  set value(newVal: T) {
    this._el.value = newVal;
  }

  *[Symbol.iterator]() {
    for (const el of this._el._cursors[this._cursorIndex]) {
      yield el.value;
    }
  }

  next(name: number | string = this._cursorIndex) {
    return this._el._cursors[name].next();
  }

  prev(name: number | string = this._cursorIndex) {
    return this._el._cursors[name].prev();
  }

}

interface Index<T, K = any> extends Container<Element<T>> {

  _indexID: number;
  _descriptor: Descriptor<T>;

  _add(el: Element<T>): [boolean, Cursor<any>];
  _deleteAt(el: Element<T>): void;
  _clear(): void;

  add(val: T): [boolean, IndexCursor<T>];
  deleteAt(key: K): number;

}

class DictIndex<T, K = T> implements Index<T, K> {

  _indexID: number;
  _descriptor: Descriptor<T>;

  index(name: number | string) {
    return this._descriptor.index(name);
  }

  constructor(public _dict: Dict<K, Element<T>>) {

  }

  _add(el: Element<T>) {
    return this._dict.add([el.value, el]);
  }

  add(val: T) {
    return this._descriptor.add(val);
  }

  _deleteAt(el: Element<T>) {
    return this._dict.deleteAt(el._cursors[this._indexID]);
  }

  delete(key: K) {
    const pos = this._dict.findKey(key);
    if (pos !== null) {
      this._descriptor.deleteAt(pos.value[1]);
    }
  }

  deleteAt(pos: IndexCursor<T>) {
    return this._descriptor.deleteAt(pos._el);
  }

  has(el: K) {
    console.log(el)
    return this._dict.hasKey(el);
  }

  *[Symbol.iterator]() {
    for (const pair of this._dict) {
      yield pair[1].value;
    }
  }

  size() {
    return this._dict.size();
  }

  _clear() {
    this._dict.clear();
  }

  clear() {
    this._descriptor.clear();
  }

}

class SeqIndex<T> implements Sequence<T>, Index<T, T> { 

  _indexID: number;
  _descriptor: Descriptor<T>;

  constructor(public _seq: Sequence<Element<T>>) {

  }

  *[Symbol.iterator]() {
    for (const el of this._seq) {
      yield el.value;
    }
  }

  has(el: T) {
    return this._descriptor.has(el);
  }

  size() {
    return this._seq.size();
  }

  _clear() {
    this._seq.clear();
  }

  clear() {
    this._descriptor.clear();
  }

  first() {
    return this._seq.first();
  }

  last() {
    return this._seq.last();
  }

  insertBefore(val: T, c: Element<T>) {
    const [added, el] = this._descriptor._add(this, val);
    if (!added) {
      return [false, el]
    }
    el._cursors[this._indexID] = this._seq.insertBefore(c._cursors[this._indexID], el);
    return [true, el._cursors[this._indexID]];
  }

  insertAfter(val: T, pos: Element<T>) {
    const [added, el] = this._descriptor._add(this, val);
    if (!added) {
      return [false, el]
    }
    el._cursors[this._indexID] = this._seq.insertAfter(pos._cursors[this._indexID], el);
    return [true, el._cursors[this._indexID]];
  }

  append(val: T) {
    const [added, el] = this._descriptor._add(this, val);
    if (!added) {
      return [false, el]
    }
    el._cursors[this._indexID] = this._seq.append(el);
    return [true, el._cursors[this._indexID]];
  }

  prepend(val: T) {
    const [added, el] = this._descriptor._add(this, val);
    if (!added) {
      return [false, el]
    }
    el._cursors[this._indexID] = this._seq.prepend(el);
    return [true, el._cursors[this._indexID]];
  }

}

export default IndexBuilder;

