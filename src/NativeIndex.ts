
import type { AddResult, Cursor, Index, Range } from "./interfaces.js";
import { getKey, isEqual, isIterable, ResolveAction } from "./util.js";

export class NativeIndexCursor<T, K extends PropertyKey> implements Cursor<T> {

  constructor(
    protected index: NativeIndex<T, K>,
    /**
     * @ignore
     */
    public key: K,
  ) {

  }

  public get value() {
    return this.index.mapping[this.key];
  }

  public set value(newValue: T) {
    this.index.mapping[this.key] = newValue;
  }

}

export class FullNativeIndexRange<T, K extends PropertyKey> {

  constructor(protected index: NativeIndex<T, K>) {
  }

  public *[Symbol.iterator]() {
    for (const key in this.index.mapping) {
      yield this.index.mapping[key];
    }
  }

}

export interface NativeIndexOptions<T, K extends PropertyKey = T & PropertyKey> {

  /**
   * An iterable that will be consumed to fill the index.
   */
  elements?: Iterable<T>;

  /**
   * A predicate for determining when two keys are equal.
   *
   * Two keys may produce the same hash result, but that does not necessarily
   * mean that they are equal. This function resolves any conflicts.
   *
   * If omitted, the {@link isEqual | built-in equality function} will be used.
   */
  keysEqual?: (a: K, b: K) => boolean;

  /**
   * A predicate determining when two elements are equal.
   *
   * This function is only called after is has been determined that the keys
   * are equal, so you may safely skip the equality check for the keys.
   *
   * If omitted, the {@link isEqual | built-in equality function} will be used.
   */
  elementsEqual?: (a: T, b: T) => boolean

  /**
   * A function that should extract the key out of an element.
   * 
   * For example, dictionaries simply take the first element of a tuple array
   * to be the key.
   */
  getKey?: (value: T) => K;

  /**
   * What to do when the key of the element being added already exists in the index.
   * 
   * This property defaults to {@link ResolveAction.Error}.
   */
  onDuplicateKeys?: ResolveAction;

  /**
   * What to do when the the element being added already exists in the index.
   * 
   * This property defaults to {@link ResolveAction.Error}.
   */
  onDuplicateElements?: ResolveAction;

}

/**
 * An index that uses native JavaScript objects to efficiently store and
 * retrieve arbitrary values.
 * 
 * This container only works with hashable JavaScript types, such as `string`
 * or `number`. Types that cannot be used as the key in a plain JavaScript
 * object will not work.
 * 
 * @experimental
 */
export class NativeIndex<T, K extends PropertyKey = T & PropertyKey> implements Index<T, K> {

  /**
   * @ignore
   */
  public mapping = Object.create(null);

  private elementCount = 0;

  public getKey: (element: T) => K;
  public areKeysEqual: (a: K, b: K) => boolean;
  public isEqual: (a: T, b: T) => boolean;
  public onDuplicateElements: ResolveAction;
  public onDuplicateKeys: ResolveAction;

  constructor(opts: Iterable<T> | NativeIndexOptions<T, K>) {
    if (isIterable(opts)) {
      opts = { elements: opts }
    }
    this.getKey = opts.getKey ?? getKey;
    this.areKeysEqual = opts.keysEqual ?? isEqual;
    this.isEqual = opts.elementsEqual ?? isEqual;
    this.onDuplicateElements = opts.onDuplicateElements ?? ResolveAction.Error;
    this.onDuplicateKeys = opts.onDuplicateKeys ?? ResolveAction.Error;
    if (opts.elements !== undefined) {
      for (const element of opts.elements) {
        this.add(element);
      }
    }
  }

  public get size(): number {
    return this.elementCount;
  }

  public has(element: T): boolean {
    return this.mapping[this.getKey(element)] !== undefined;
  }

  public delete(element: T): boolean {
    const key = this.getKey(element);
    if (this.mapping[key] === undefined) {
      return false;
    }
    delete this.mapping[key];
    return true;
  }

  public deleteKey(key: K): number {
    if (this.mapping[key] === undefined) {
      return 0;
    }
    delete this.mapping[key];
    return 1;
  }

  public *[Symbol.iterator]() {
    for (const key in this.mapping) {
      yield this.mapping[key];
    }
  }

  public clear(): void {
    this.mapping = Object.create(null);
    this.elementCount = 0;
  }

  public deleteAt(position: NativeIndexCursor<T, K>): void {
    delete this.mapping[position.key];
  }

  public hasKey(key: K): boolean {
    return this.mapping[key] !== undefined;
  }

  public findKey(key: K): NativeIndexCursor<T, K> | undefined {
    if (this.mapping[key] !== undefined) {
      return new NativeIndexCursor(this, key);
    }
  }

  public clone(): NativeIndex<T, K> {
    return new NativeIndex({
      elements: this,
      keysEqual: this.areKeysEqual,
      elementsEqual: this.isEqual,
      getKey: this.getKey,
      onDuplicateElements: this.onDuplicateElements,
      onDuplicateKeys: this.onDuplicateKeys,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public equalKeys(key: K): Range<T> {
    throw new Error(`Method not implemented.`)
  }

  public toRange(): Range<T> {
    return this;
  }

  public *cursors() {
    for (const key in this.mapping) {
      yield new NativeIndexCursor(this, key as K);
    }
  }

  public deleteAll(element: T): number {
    return this.deleteKey(this.getKey(element));
  }

  public add(element: T): AddResult<T> {
    const key = this.getKey(element);
    const otherElement = this.mapping[key];
    const cursor = new NativeIndexCursor(this, key);
    if (otherElement !== undefined) {
      switch (this.onDuplicateKeys) {
        case ResolveAction.Error:
          throw new Error(`The key ${String(key)} already exists in this index and duplicates are not allowed.`);
        case ResolveAction.Ignore:
          return [false, cursor];
        case ResolveAction.Insert:
          throw new Error(`Cannot insert an element with a key that already exists into a container that does not support it.`)
      }
      if (this.isEqual(element, otherElement)) {
        switch (this.onDuplicateElements) {
          case ResolveAction.Error:
            throw new Error(`The element ${element} is already present in this index and duplicates are not allowed.`)
          case ResolveAction.Ignore:
            return [false, cursor];
        case ResolveAction.Insert:
          throw new Error(`Cannot insert an element with a key that already exists into a container that does not support it.`)
        }
      }
    } else {
      this.elementCount++;
    }
    this.mapping[key] = element;
    return [true, cursor];
  }

}
