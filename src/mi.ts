
import { Container, Sequence, Structure, Dict, MultiDict, Cursor } from "./interfaces"
import { get, lesser, equal, hash } from "./util"
import Types, { Type } from "./types"
import toPath = require("lodash/toPath");
import isArray = require('lodash/isArray');

const registeredContainers = [];

const E_NO_MATCH = `No registered container found that matched given criteria. Perhaps you forgot import the implementation or your container forgot to call registerContainer()?`;

export function registerContainer(config) {
  registeredContainers.push(config);
}

function push<T>(arr: T[], val: T): T[] {
  const newArr = arr.slice();
  newArr.push(val);
  return newArr;
}

function andmap<T>(vals: T[], proc: (el: T) => boolean): boolean {
  for (const el of vals) {
    if (!proc(el))
      return false
  }
  return true;
}

function pathToType(name: string, type: Type, path = []) {
  switch (type.name) {
  case name:
    return path;
  case 'Array':
    for (let i = 0; i < type.args.length; ++i) {
      const p = pathToType(name, type.args[i], push(path, i));
      if (p !== null) {
        return p;
      }
    }
    return null;
  default:
    return null;
  }
}

function isOfType(type: Type, val: any) {
  switch (type.resolve().name) {
  case 'Function':
    return typeof val === 'function';
  case 'String':
    return typeof val === 'string';
  case 'Number':
    return typeof val === 'number';
  case 'PropertyKey':
    return isPropertyKey(val);
  case 'PropertyPath':
  return typeof val === 'string' 
      || (isArray(val) && andmap(val, isPropertyKey));
  default:
    return false;
  }
}

function isPropertyKey(val: any) {
  return typeof val === 'string'
      || typeof val === 'number'
      || typeof val === 'symbol';
}

function fromPath(path: string | string[]): string {
  if (path === undefined)
    return '';
  if (typeof path === 'string')
    return path;
  return path.join('.');
}

function last<T>(arr: T[]): T {
  return arr[arr.length-1];
}

export function builder<T = any>() {

  const calls = [];

  let building = [null, false, null];

  const keyDefaults = {
    Lesser: Object.create(null),
    Equality: Object.create(null),
    Hasher: Object.create(null),
  }

  const uniqueKeys = new Set<string>();

  const base: any = function () { };

  const proxy = new Proxy(base, {
    get(target, key, receiver) {
      if (Reflect.has(target, key)) {
        return Reflect.get(target, key);
      }
      building[0] = key;
      return save;
    }
  });

  function save(...args) {
    building[2] = args;
    calls.push(building)
    building = [null, false, null]
    return proxy;
  }

  base.defaultLesser = function (proc, key = '') {
    keyDefaults.Lesser[fromPath(key)] = proc;
    return proxy;
  }

  base.unique = function (key?: string) {
    uniqueKeys.add(fromPath(key));
    return proxy;
  }

  base.reverse = function () {
    const call = last(calls);
    call[1] = true;
    return proxy;
  }

  base.defaultEqual = function(proc, key = '') {
    keyDefaults.Equality[fromPath(key)] = proc;
    return proxy;
  }

  base.defaultHash = function (proc, key = '') {
    keyDefaults.Hasher[fromPath(key)] = proc;
    return proxy;
  }

  base.build = function () {

    const argDefaults = {
      Lesser: lesser,
      Equality: equal,
      Hasher: hash,
    }

    const descriptor = new Descriptor<T>();
    let currComplexity = { lookup: Infinity }

    for (const call of calls) {

      const [syntax, reversed, args] = call;
      const match = registeredContainers.filter(type => type.name === syntax)[0];
      if (match === undefined) {
        throw new Error(E_NO_MATCH);
      }

      const nextArg = (type: Type, def?: any) => {
        for (let i = 0; i < args.length; ++i) {
          if (isOfType(type, args[i])) {
            const arg = args[i];
            args.splice(i, 1);
            return arg;
          }
        }
        return def;
      }
      
      const keyPath = toPath(nextArg(Types.PropertyPath(), []));
      let name = nextArg(Types.String());
      if (name === undefined && keyPath.length === 1) {
        name = keyPath[0];
      }
      const elPath = pathToType('Key', match.elementType) || [];

      const getArg = (type: Type) => {
        let res = nextArg(type) 
        if (res !== undefined) return res;
        res = keyDefaults[fromPath(keyPath)];
        if (res !== undefined) return res;
        return argDefaults[type.name]
      }

      const cached = new Map<any, any>();

      const realArgs = match.paramTypes.map(type => {
        switch (type.name) {
        //case 'Container':
          //const [name, ...args] = type.args;
          //return build(
        case 'KeyGetter':
          const fullPath = elPath.concat(keyPath);
          return el => get(el, fullPath);
        case 'Hasher':
          const hash = getArg(type);
          return val => hash(val);
        case 'Equality':
        case 'Lesser':
          const lt = getArg(type);
          return reversed ? (a, b) => lt(b, a) && !lt(a, b) : lt
        default:
          return getArg(type);;
        }
      });

      const index = uniqueKeys.has(fromPath(keyPath))
        ? match.buildUnique(...realArgs)
        : match.build(...realArgs);
      index._info = match;
      index._descriptor = descriptor;
      descriptor.addIndex(index, name);
      
      if (!descriptor._fastLookup && match.optimized) {
        descriptor._fastLookup = index;
      }

    }

    return descriptor.defaultIndex();
  }

  return proxy;
}

interface NamedSet<T> {
  [key: string]: T;
}

export class Descriptor<T> {

  _indices: Index<T>[] = [];
  _indexNames: NamedSet<number> = Object.create(null);
  _fastLookup: Index<T>;

  defaultIndex() {
    if (this._indices.length === 0) {
      throw new Error(`container has no indices defined`);
    }
    return this._indices[0];
  }

  addIndex(index: Index<T>, name?: string) {
    const i = this._indices.length;
    this._indices.push(index);
    index._indexID = i;
    if (name !== undefined) {
      this._indexNames[name] = i;
    }
  }

  _add(src: Index<T>, val: T) {
    const el = new Element<T>(val);
    const posns = [];
    for (let i = 0; i < this._indices.length; ++i) {
      if (this._indices[i] !== src) {
        const [added, otherCursor] = this._indices[i]._add(el);
        if (!added) {
          for (let j = 0; j < posns.length; ++j) {
            this._indices[j]._deleteAt(posns[j]);
          }
          return [false, posns[0].value];
        }
        el._cursors[i] = otherCursor;
      }
    }
    return [true, el];
  }

  _deleteAt(src: Index<T>, pos: Element<T>) {
    for (let i = 0; i < this._indices.length; ++i) {
      if (this._indices[i] !== src) {
        this._indices[i]._deleteAt(pos._cursors[i]);
      }
    }
  }

  _getIndexID(name: number | string) {
    if (typeof name === 'number')
      return name;
    if (this._indexNames[name] === undefined)
      throw new Error(`index '${name}' not found`);
    return this._indexNames[name];
  }

  index(name: number | string) {
    const index = this._indices[this._getIndexID(name)];
    if (index === undefined) {
      throw new RangeError(`index ${name} not found`);
    }
    return index;
  }

  has(val: T) {
    return this._fastLookup.has(val);
  }

  add(val: T) {
    const el = new Element<T>(val);
    const posns = [];
    for (let i = 0; i < this._indices.length; ++i) {
      const [added, otherCursor] = this._indices[i]._add(el);
      if (!added) {
        for (let j = 0; j < posns.length; ++j) {
          this._indices[j]._deleteAt(posns[j]);
        }
        return [false, new IndexCursor(this, otherCursor.value, i)];
      }
      el._cursors[i] = otherCursor;
    }
    return [true, el];
  }

  deleteAt(pos: Element<T>) {
    for (let i = 0; i < this._indices.length; ++i) {
      this._indices[i]._deleteAt(pos._cursors[i]);
    }
  }
  
  clear() {
    for (let i = 0; i < this._indices.length; ++i) {
      this._indices[i]._clear();
    }
  }

}

export export class Element<T> implements Cursor<T> {

  _cursors: Cursor<any>[] = [];

  constructor(public value: T) {

  }

  //next() {
    //const n = this._cursors[0].next();
    //if (n !== null) {
      //return n.value;
    //}
    //return null;
  //}

  //prev() {
    //const n = this._cursors[0].prev();
    //if (n !== null) {
      //return n.value;
    //}
    //return null;
  //}

}

export class IndexCursor<T> implements Cursor<T> {

  constructor(public _descriptor: Descriptor<T>, public _el: Element<T>, public _cursorIndex: number) {

  }

  get value() {
    return this._el.value;
  }

  set value(newVal: T) {
    this._el.value = newVal;
  }

  get index() {
    return this._descriptor._indices[this._cursorIndex];
  }

  *[Symbol.iterator]() {
    const index = this._descriptor._indices[this._cursorIndex];
    for (const val of this._el._cursors[this._cursorIndex]) {
      yield index._getValue(val);
    }
  }

  next(name: number | string = this._cursorIndex) {
    if (typeof name === 'string')
      name = this._descriptor._getIndexID(name);
    const n = this._el._cursors[name].next();
    if (n === null)
      return null
    return new IndexCursor(this._descriptor, this.index._getElement(n.value), this._cursorIndex);
  }

  prev(name: number | string = this._cursorIndex) {
    if (typeof name === 'string')
      name = this._descriptor._getIndexID(name);
    const p = this._el._cursors[name].prev();
    if (p === null)
      return null
    return new IndexCursor(this._descriptor, this.index._getElement(p.value), this._cursorIndex);
  }

}

export interface Index<T, K = any> {

  _indexID: number;
  _descriptor: Descriptor<T>;
  _getElement(val: any): Element<T>;
  _getValue(val: any): T;

  _add(el: Element<T>): [boolean, Cursor<any>];
  _deleteAt(el: Cursor<T>): void;
  _clear(): void;

  index(name: number | string): Index<T>;
  add(val: T): [boolean, IndexCursor<T>];
  deleteAt(key: K): number;
  has(val: K): boolean;

}

export default builder;

