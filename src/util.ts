
import { Structure, Sequence, Cursor, View } from "./interfaces"
import * as XXH from "xxhashjs"

// TODO optimize
export function hash(val: any) {
  return XXH.h32(JSON.stringify(val), 0xABCD).toNumber();
}

export function get(val: any, path: any[]) {
  for (const chunk of path) {
    val = val[chunk];
  }
  return val;
}

export function liftKeyed(proc: Function, path: string[]): Function {
  if (path.length === 0) {
    return proc;
  } else {
    return (...args) => proc(...args.map(arg => get(arg, path)));
  }
}

export function liftLesser<T>(lt: (a: T, b: T) => boolean): (a: T, b: T) => number {
  return function (a, b) {
    if (lt(a, b))
      return -1;
    if (lt(b, a))
      return 1;
    return 0;
  }
}
export abstract class ViewBase<T> implements View<T> {

  abstract reverse(): View<T>;
  
  abstract [Symbol.iterator](): Iterator<T>;

  filter(pred: (el: T) => boolean) {
    return new FilteredView<T>(this, pred);
  }

  map<R>(proc: (el: T) => R) {
    return new MappedView<T, R>(this, proc);
  }

}

export class MappedView<T, R> extends ViewBase<R> {

  constructor(public _view: View<T>, public _proc: (el: T) => R) {
    super();
  }

  reverse() {
    return new MappedView<T, R>(this._view.reverse(), this._proc);
  }

  *[Symbol.iterator]() {
    const proc = this._proc;
    for (const val of this._view) {
      yield proc(val);
    }
  }

}

export class FilteredView<T> extends ViewBase<T> {

  constructor(public _view: View<T>, public _pred: (el: T) => boolean) {
    super();
  }

  reverse() {
    return new FilteredView<T>(this._view.reverse(), this._pred);
  }

  *[Symbol.iterator]() {
    const pred = this._pred;
    for (const value of this._view) {
      if (pred(value))
        yield value;
    }
  }

}

export interface Newable<T> {
  new(...args): T;
}

export function find<T>(pos: Cursor<T>, val: T, eq: (a: T, b: T) => boolean = equal) {
  while (true) {
    if (pos === null) {
      return null;
    }
    if (eq(pos.value, val)) {
      return pos;
    }
    pos = pos.next();
  }
}

export function makeAppender<T>(Cont: Newable<Sequence<T>>) {
  return class extends Cont implements Structure<T> {
    add(el: T) {
      return this.append(el);
    }
  }
}

export function makePrepender<T>(Cont: Newable<Sequence<T>>) {
  return class extends Cont implements Structure<T> {
    add(el: T) {
      return this.prepend(el);
    }
  }
}

export function filterView<T>(view: View<T>, pred: (el: T) => boolean): View<T> {
  return new class implements View<T> {
    reverse() {
      return filterView(view.reverse(), pred);
    }
    *cursors() {

    }
    *[Symbol.iterator]() {
      for (const val of view) {
        if (pred(val)) 
          yield val;
      }
    }
  }
}

export function mapView<T,R>(view: View<T>, proc: (el: T) => R): View<R> {
  return new class implements View<R> {
    reverse() {
      return mapView(view.reverse(), proc);
    }
    *[Symbol.iterator]() {
      for (const val of view) {
        yield proc(val);
      }
    }
  }
}

export function isObject(val: any) {
  return typeof val === 'object' 
    && val !== null 
    && typeof val.length === 'undefined';
}

export function isArray(val: any) {
  return typeof val === 'object' 
    && val !== null 
    && typeof val.length !== 'undefined';
}

export function lesser(a: any, b: any) {
  //if (a === undefined && b !== undefined) {
    //return true;
  //}
  if (typeof a === 'number' && typeof b === 'number') {
    return a < b;
  } else if (typeof a === 'string' && typeof b === 'string') {
    return a < b;
  } else if (isArray(a) && isArray(b)) {
    if (a.length < b.length) {
      return true;
    }
    if (a.length > b.length) {
      return false;
    }
    let foundLesser = false;
    for (let i = 0; i < a.length; ++i) {
      if (lesser(a[i], b[i])) {
        foundLesser = true;
      } else if (lesser(b[i], a[i])) {
        return false;
      }
    }
    return foundLesser;
  } else if (isObject(a) && isObject(b)) {
    const ks1 = Object.keys(a).sort();
    const extra = new Set<string>(Object.keys(b));
    if (ks1.length > Object.keys(b).length) 
      return false;
    let foundLesser = false;
    for (const key of ks1) {
      if (b[key] === undefined) {
        return false;
      }
      extra.delete(key);
      if (lesser(a[key], b[key])) {
        foundLesser = true;
        continue;
      }
      if (lesser(b[key], a[key])) {
        return false;
      }
    }
    return foundLesser ? extra.size >= 0 : extra.size > 0;
  } else {
    return false;
  }
}

export function equal(a: any, b: any) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a === b;
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return a === b;
  }
  if (isArray(a) && isArray(b)) {
    if (a.length !== b.length) 
      return false;
    for (let i = 0; i < a.length; ++i) {
      if (!equal(a[i], b[i]))
        return false;
    }
    return true;
  }
  if (isObject(a) && isObject(b)) {
    const ks1 = Object.keys(a);
    if (ks1.length !== Object.keys(b).length)
      return false;
    for (const key of ks1) {
      if (typeof b[key] === 'undefined') {
        return false;
      }
      if (!equal(a[key], b[key]))
        return false;
    }
    return true;
  }
}

