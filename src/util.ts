
import { CollectionRange, Cursor } from "./interfaces";

export function isIterable<T = any>(value: any): value is Iterable<T> {
  return Symbol.iterator in Object(value);
}

export const getKeyTag = Symbol('object key property');

function isPrimitive(value: any): boolean {
  return value === null
      || typeof(value) === 'number'
      || typeof(value) === 'string'
      || typeof(value) === 'boolean'
      || typeof(value) === 'bigint';
}

export function getKey(value: any) {
  if (isPrimitive(value)) {
    return value;
  }
  if (getKeyTag in value) {
    return value[getKeyTag];
  }
  if (Array.isArray(value)) {
    return value[0];
  }
  throw new Error(`Could not extract a key-value pair out of the provided JavaScript object`)
}

/**
 * A symbol that is used to define a custom hash method for a certain class or
 * object.
 *
 * If this tag is present on an object, [[hash]] will call it with a callback
 * that you can use to add your fields to the resulting hash.
 *
 * ```
 * import { hashTag, Hasher } from "scl";
 *
 * class Person {
 *
 *   constructor(
 *     public fullName: string,
 *     public email: string,
 *   ) {
 *
 *   }
 *
 *   [hashTag](h: Hasher): void {
 *     h(this.fullName);
 *   }
 *
 * }
 * ```
 *
 * @see [[Hasher]]
 */
export const hashTag = Symbol('object hash method');

/**
 * The callback given to methods that implement the [[hashTag]] protocol.
 *
 * @see [[hashTag]]
 */
export type Hasher = (value: any) => void;

/**
 * Hash any value to a number that should provide the least amount of
 * collisions.
 *
 * This method will use [[hashTag]] if it is present on an object to hash
 * according to a method you provided.
 *
 * The logic of this hash function was roughly taken from [this StackOverflow answer][1].
 *
 * [1]: https://stackoverflow.com/a/2741898/1173521
 *
 * @param value The value to hash
 * @returns A hash code
 * @see [[hashTag]]
 */
export function hash(value: any): number {
  let result = 17;
  const combine = (num: number) => {
    result = result * 31 + num;
  }
  const visit = (value: any) => {
    if (value === null) {
      combine(0);
      return;
    }
    if (typeof(value) === 'boolean') {
      combine(value ? 1 : 0);
      return;
    }
    if (typeof(value) === 'number') {
      combine(value);
      return;
    }
    if (typeof(value) === 'string') {
      for (let i = 0; i < value.length; i++) {
        combine(value.charCodeAt(i));
      }
      return;
    }
    if (Array.isArray(value)) {
      for (const element of value) {
        visit(element);
      }
      return;
    }
    if (isObject(value)) {
      if (value[hashTag] !== undefined) {
        value[hashTag](visit);
      }
      for (const key of Object.keys(value)) {
        const property = value[key];
        visit(property);
      }
      return;
    }
    throw new Error(`Could not hash the given object.`)
  }
  visit(value);
  return result;
}

/**
 * A symbol that is used to define a custom hash method for a certain class or
 * object.
 *
 * If this tag is present on an object, [[lessThan]] will use the method
 * associated with this tag to compare the given object with something else.
 *
 * Note that the value passed to the object's method does not have to be of the
 * same type. It may be possible that a number is passed in, or something else
 * entirely. It is your responsibility to perform the necessary checks.
 *
 * ```
 * class Character {
 *
 *   constructor(public readonly charCode) {
 *
 *   }
 *
 *   public [compareTag](other: any): boolean {
 *     return other instanceof Character
 *         && this.charCode < other.charCode;
 *   }
 *
 * }
 * ```
 *
 * @see [[lessThan]]
 */
export const compareTag = Symbol('object comparison method');

/**
 * Check whether the given value is smaller than another value.
 *
 * If a value is an object that contains a [[compareTag]], then this function
 * will call that method and return whatever that method returned. This way,
 * you can define your own classes with custom comparison operators. See the
 * [[compareTag]] for an example.
 *
 * There are some specific rules when it comes to checking built-in JavaScript
 * objects:
 *
 * - A string is smaller than another string if and only if each character in
 *   the first string is smaller than the corresponding character in the second
 *   string. If the second string contains more characters than the first but
 *   the overlapping characters are smaller or equal, the first string will
 *   also be considered smaller than the first.
 * - An array is smaller than
 *   another array if
 *   each element of the first
 *   array is smaller than than each corresponding element of the second array.
 *   An exception is made when the second array contains more elements than the
 *   first array. In that case, the first array is smaller if and only if each
 *   element is less then or equal to the corresponding element in the second
 *   array. The remaining elements 'force' the array to be larger.
 * - An object is only smaller than another object if the values of the first
 *   object is smaller then the corresponding value of the second object. An
 *   exception is made when the second object contains more keys than the first
 *   object. In that case, the first obejct is smaller if and only if each
 *   value in the first object is smaller or equal to the corresponding value
 *   in the second object. The extra keys in the second object 'force' the
 *   second object to be larger.
 *
 * The above rules might seem strange at first, but they ensure that we can
 * perform equality checks on string, arrays and objects by just using
 * [[lessThan]], as demonstrated in the following code:
 * 
 * ```
 * import { lessThan } from "scl";
 * 
 * function equalByLesser(a, b) {
 *   return !lessThan(a, b) && !lessThan(b, a);
 * }
 *
 * console.log(equalByLesser(1, 1)) // true
 * console.log(equalByLesser(1, 2)) // false
 * console.log(equalByLesser('foo', 'foo')) // true
 * console.log(equalByLesser('foo', 'bar')) // false
 * console.log(equalByLesser([1, 2], [1, 2])) // true
 * console.log(equalByLesser([1, 2], [1, 2, 3])) // false
 * console.log(equalByLesser({ foo: 42 }, { foo: 42 }) // true
 * console.log(equalByLesser({ foo: 42 }, { foo: 42, bar: 33 }) // false
 * ```
 *
 * @see [[compareTag]]
 * @see [[hash]]
 * @see [[isEqual]]
 */
export function lessThan(a: any, b: any) {
  if (typeof(a) === "number" && typeof(b) === "number") {
    return a < b;
  }
  if (typeof(a) === "string" && typeof(b) === "string") {
    return a < b;
  }
  if (isArray(a) && isArray(b)) {
    if (a.length > b.length) {
      return false;
    }
    const allowEqual = a.length < b.length;
    for (let i = 0; i < a.length; ++i) {
      if (allowEqual && isEqual(a[i], b[i])) {
        continue;
      }
      if (!lessThan(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  if (isObject(a) && isObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    const allowEqual = keysB.length > keysA.length;
    for (const key of keysA) {
      if (b[key] === undefined) {
        return false;
      }
      if (allowEqual && isEqual(a[key], b[key])) {
        continue;
      }
      if (!lessThan(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }
  return false;
}

/**
 * A symbol that is used to define a custom equality operator for a class or
 * object.
 *
 * ```
 * import { isEqual, isEqualTag } from "scl";
 *
 * class Cat {
 *
 *   constructor(
 *     public owner: Person,
 *     public name: string,
 *     public age: number
 *   ) {
 *
 *   }
 *
 *   public [isEqualTag](other: any) {
 *     return value instanceof Cat
 *         && isEqual(cat.owner, other.owner)
 *         && cat.name === other.name;
 *   }
 *
 * }
 * ```
 *
 * @see [[isEqual]]
 */
export const isEqualTag = Symbol('object equality method');

/**
 * Check whether two values are the same
 *
 * If `a` is an object that contains the [[isEqualTag]], then this function
 * will call that method and return whatever that method returned. If `b`
 * contains the [[isEqualTag]], it will attempt the same with `b`. This way,
 * you can define your own classes with custom equality operators. See the
 * [[isEqualTag]] for more information.
 *
 * Built-in JavaScript objects are just checked as if they were encoded to a
 * JSON format and the resulting ouput is identical. For exmple, two plain
 * JavaScript are the same if their enumerable keys contain the same values.
 *
 * @see [[isEqualTag]]
 * @see [[lessThan]]
 */
export function isEqual(a: any, b: any): boolean {
  if (typeof a === "number" && typeof b === "number") {
    return a === b;
  }
  if (typeof a === "string" && typeof b === "string") {
    return a === b;
  }
  if (isArray(a) && isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; ++i) {
      if (!isEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  if (isObject(a) && isObject(b)) {
    if (a[isEqualTag] !== undefined) {
      return a[isEqualTag](b);
    }
    if (b[isEqualTag] !== undefined) {
      return b[isEqualTag](a);
    }
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
      return false;
    }
    for (const key of keysA) {
      if (b[key] === undefined) {
        return false;
      }
      if (!isEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }
  return false;
}

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export function omit<O extends object, K extends keyof O>(obj: O, ...keys: K[]): Omit<O, K>  {
  const out: any = {}; // no need to typecheck
  for (const key of Object.keys(obj)) {
    if (keys.indexOf(key as K) === -1) {
      out[key] = obj[key as K];
    }
  }
  return out;
}

export class EmptyRange<T> implements CollectionRange<T> {

  constructor(public readonly reversed = false) { }

  public filter(predicate: (element: Cursor<T>) => boolean) {
    return this;
  }

  public reverse() {
    return new EmptyRange<T>(!this.reversed);
  }

  public get size() {
    return 0;
  }

  public *cursors(): IterableIterator<Cursor<T>> {

  }

  public *[Symbol.iterator](): IterableIterator<T> {

  }

}

export function get(value: any, path: any[]) {
  for (const chunk of path) {
    value = value[chunk];
  }
  return value;
}

export function liftKeyed(proc: Function, path: string[]): Function {
  if (path.length === 0) {
    return proc;
  } else {
    return (...args: any[]) => proc(...args.map((arg) => get(arg, path)));
  }
}

export function liftLesser<T>(lt: (a: T, b: T) => boolean): (a: T, b: T) => number {
  return function(a, b) {
    if (lt(a, b)) {
      return -1;
    }
    if (lt(b, a)) {
      return 1;
    }
    return 0;
  };
}

/**
 * Abstract base class for implementing new cursors for a specific type of
 * collection.
 *
 * ```ts
 * class MyCursor<T> extends CursorBase<T> {
 *   // ...
 * }
 * ```
 */
export abstract class CursorBase<T> implements Cursor<T> {

  public abstract value: T;

  public *nextAll(): IterableIterator<Cursor<T>> {
    let cursor: Cursor<T> | null = this;
    do {
      yield cursor;
      cursor = cursor.next!();
    } while (cursor !== null);
  }

  public *prevAll(): IterableIterator<Cursor<T>> {
    let cursor: Cursor<T> | null = this;
    do {
      yield cursor;
      cursor = cursor.prev!();
    } while (cursor !== null);
  }

}

/**
 * Abstract base class for implementing new ranges on a specific type of
 * collection.
 *
 * ```ts
 * class MyRange<T> extends RangeBase<T> {
 *   // ...
 * }
 * ```
 */
export abstract class RangeBase<T> implements CollectionRange<T> {

  public abstract readonly size: number;

  public abstract cursors(): IterableIterator<Cursor<T>>;

  public abstract [Symbol.iterator](): IterableIterator<T>;

  public filter(pred: (el: Cursor<T>) => boolean): CollectionRange<T> {
    return new FilteredRange<T>(this, pred);
  }

}

export class FilteredRange<T> extends RangeBase<T> {

  constructor(public _range: CollectionRange<T>, public _pred: (el: Cursor<T>) => boolean) {
    super();
  }

  get size() {
    return this._range.size;
  }

  public *cursors() {
    for (const cursor of this._range.cursors()) {
      if (this._pred(cursor)) {
        yield cursor;
      }
    }
  }

  public reverse() {
    return new FilteredRange<T>(this._range.reverse!(), this._pred);
  }

  public *[Symbol.iterator]() {
    for (const cursor of this._range.cursors()) {
      if (this._pred(cursor)) {
        yield cursor.value;
      }
    }
  }

}

export type Newable<T> = new(...args: any[]) => T;

export function isObject(val: any): boolean {
  return Object.prototype.toString.call(val) === '[object Object]';
}

export function isArray(val: any) {
  return Object.prototype.toString.call(val) === "[object Array]";
}
