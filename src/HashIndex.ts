
import type { Cursor, Index, AddResult, Range } from "./interfaces.js";
import { DoubleLinkedList, DoubleLinkedListCursor } from "./DoubleLinkedList.js";
import { getKey as defaultGetKey, EmptyRange, isEqual, RangeBase, hash, ResolveAction, isIterable } from "./util.js";

/**
 * @ignore
 */
export type Bucket<T> = DoubleLinkedList<T>;

export class HashIndexCursor<T> implements Cursor<T> {

  constructor(public _bucket: Bucket<T>, public _bucketPos: DoubleLinkedListCursor<T>) {

  }

  public get value(): T {
    return this._bucketPos.value;
  }

  public set value(newVal: T) {
    this._bucketPos.value = newVal;
  }

}

const DEFAULT_BUCKET_COUNT = 255;

class FullHashRange<T, K> extends RangeBase<T> {

  constructor(protected _hash: HashIndex<T, K>) {
    super();
  }

  get size() {
    return this._hash.size;
  }

  public *[Symbol.iterator]() {
    for (const bucket of this._hash._array) {
      if (bucket !== undefined) {
        for (const element of bucket) {
          yield element;
        }
      }
    }
  }

  public *cursors() {
    for (const bucket of this._hash._array) {
      if (bucket !== undefined) {
        for (const cursor of bucket.toRange().cursors()) {
          yield new HashIndexCursor(bucket, cursor as DoubleLinkedListCursor<T>);
        }
      }
    }
  }

}

export interface HashIndexOptions<T, K = T> {

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
   * If omitted, the [[isEqual built-in equality function]] will be used.
   */
  keysEqual?: (a: K, b: K) => boolean;

  /**
   * The hashing function that will be used to map entries to a certain bucket.
   *
   * If omitted, the [[hash built-in hash function]] will be used.
   */
  getHash?: (element: K) => number;

  /**
   * A predicate determining when two elements are equal.
   *
   * This function is only called after is has been determined that the keys
   * are equal, so you may safely skip the equality check for the keys.
   *
   * If omitted, the [[isEqual built-in equality function]] will be used.
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
   * The initial capacity of the underling vector that will store the hash buckets.
   */
  capacity?: number;

  /**
   * What to do when the key of the element being added already exists in the index.
   * 
   * This property defaults to [[ResolveAction.Error]].
   */
  onDuplicateKeys?: ResolveAction;

  /**
   * What to do when the the element being added already exists in the index.
   * 
   * This property defaults to [[ResolveAction.Error]].
   */
  onDuplicateElements?: ResolveAction;
}

/**
 * A data structure that maps elements to different memory locations so that
 * they can be very efficiently stored and retrieved.
 *
 * **Choosing the key and determining how to detect duplicates**
 *
 * In the next example, we index the states of a [finite-state machine][1].
 * Each state has a unique `id` that we'd like to use as key. There is only one
 * instance of each unique `FSMState`, so we can instruct `HashIndex` to use
 * the much simpler strict equality check instead of the more advanced
 * [[isEqual]]. Likewise, keys are just numbers, so we can save come CPU cycles
 * by directly comparing them.
 *
 * ```
 * import { HashIndex } from "scl";
 *
 * interface FSMState {
 *   id: string;
 *   isFinal: boolean;
 *   edgeCount: number;
 *   nextStates: Array<[string, FSMState]>;
 * }
 *
 * const s0: FSMState = {
 *   id: 0,
 *   isFinal: false,
 *   edgeCount: 1,
 *   nextStates: [
 *     ['a', s1],
 *   ]
 * }
 *
 * const s1: FSMState = {
 *   id: 1,
 *   isFinal: true,
 *   edgeCount 0,
 *   nextStates: [],
 * }
 *
 * const allStates = new HashIndex<({
 *   getKey: state => state.id,
 *   compareKeys: (a, b) => a < b,
 *   isEqual: (a, b) => a === b,
 *   elements: [s0, s1],
 * });
 *
 * assert(allStates.getKey(1) === s1);
 * ```
 *
 * [2]: https://en.wikipedia.org/wiki/Finite-state_machine
 *
 * @see [[AVLTreeIndex]] for when the elements have to be sorted and there are frequent lookups
 * @see [[RBTreeIndex]] for when the elements have to be sorted and there are frequent mutations
 */
export class HashIndex<T, K = T> implements Index<T, K> {

  /**
   * @ignore
   */
  public _array: Array<Bucket<T>>;

  /**
   * @ignore
   */
  protected elementCount = 0;

  protected getHash: (element: K) => number
  protected keysEqual: (a: K, b: K) => boolean
  protected elementsEqual: (a: T, b: T) => boolean
  protected getKey: (value: T) => K;

  protected onDuplicateKeys: ResolveAction;
  protected onDuplicateElements: ResolveAction;

  /**
   * @ignore
   */
  constructor(opts: HashIndexOptions<T, K> = {}) {
    if (isIterable(opts)) {
      opts = { elements: opts }
    }
    this.keysEqual = opts.keysEqual ?? isEqual;
    this.elementsEqual = opts.elementsEqual ?? isEqual;
    this.getHash = opts.getHash ?? hash;
    this.getKey = opts.getKey ?? defaultGetKey;
    this.onDuplicateKeys = opts.onDuplicateKeys ?? ResolveAction.Error;
    this.onDuplicateElements = opts.onDuplicateElements ?? ResolveAction.Error;
    this._array = new Array(opts.capacity ?? DEFAULT_BUCKET_COUNT);
    if (opts.elements !== undefined) {
      for (const element of opts.elements) {
        this.add(element);
      }
    }
  }

  public get size(): number {
    return this.elementCount;
  }

  public clear(): void {
    this._array.splice(0, this._array.length);
    this.elementCount = 0;
  }

  public equalKeys(key: K): Range<T> {
    const bucket = this._getBucket(key);
    if (bucket === null) {
      return new EmptyRange<T>();
    }
    return bucket
      .toRange()
      .filter((cursor: Cursor<T>) => this.keysEqual(this.getKey(cursor.value), key));
  }

  public add(element: T): AddResult<T> {
    const key = this.getKey(element);
    const h = this.getHash(key);
    const i = h % this._array.length;
    const bucket = this._array[i] === undefined
      ? this._array[i] = new DoubleLinkedList<T>()
      : this._array[i];
    for (const position of bucket.toRange().cursors()) {
      if (this.keysEqual(this.getKey(position.value), key)) {
        switch (this.onDuplicateKeys) {
          case ResolveAction.Error:
            throw new Error(`The key ${key} already exists in this index and duplicates are not allowed.`);
          case ResolveAction.Replace:
            position.value = element;
          case ResolveAction.Ignore:
            return [false, new HashIndexCursor(bucket, position)]
        }
        if (this.elementsEqual(position.value, element)) {
          switch (this.onDuplicateElements) {
            case ResolveAction.Error:
              throw new Error(`The element ${element} is already present in this index and duplicates are not allowed.`)
            case ResolveAction.Replace:
              position.value = element;
            case ResolveAction.Ignore:
              return [false, new HashIndexCursor(bucket, position)];
          }
        }
      }
    }
    const bucketPos = bucket.append(element);
    ++this.elementCount;
    return [true, new HashIndexCursor<T>(bucket, bucketPos)];
  }

  public deleteAt(cursor: HashIndexCursor<T>) {
    cursor._bucket.deleteAt(cursor._bucketPos);
    --this.elementCount;
  }

  public findKey(key: K): HashIndexCursor<T> | null {
    const bucket = this._getBucket(key);
    if (bucket === null) {
      return null;
    }
    for (const cursor of bucket.toRange().cursors()) {
      if (this.keysEqual(this.getKey(cursor.value), key)) {
        return new HashIndexCursor<T>(bucket, cursor);
      }
    }
    return null;
  }

  public has(element: T): boolean {
    for (const cursor of this.equalKeys(this.getKey(element)).cursors()) {
      if (this.elementsEqual(cursor.value, element)) {
        return true;
      }
    }
    return false;
  }

  public hasKey(key: K) {
    return this.findKey(key) !== null;
  }

  /**
   * @ignore
   */
  public _getBucket(key: K): Bucket<T> | null {
    const h = this.getHash(key);
    const i = h % this._array.length;
    const bucket = this._array[i];
    if (bucket === undefined) {
      return null;
    }
    return bucket;
  }

  public deleteKey(key: K) {
    const bucket = this._getBucket(key);
    if (bucket === null) {
      return 0;
    }
    let deleted = 0;
    for (const cursor of bucket.toRange().cursors()) {
      if (this.keysEqual(this.getKey(cursor.value), key)) {
        bucket.deleteAt(cursor);
        --this.elementCount;
        ++deleted;
      }
    }
    return deleted;
  }

  public [Symbol.iterator]() {
    return this.toRange()[Symbol.iterator]();
  }

  public toRange() {
    return new FullHashRange<T, K>(this);
  }

  public delete(el: T) {
    const cursor = this.findKey(this.getKey(el));
    if (cursor === null || !this.elementsEqual(el, cursor.value)) {
      return false;
    }
    this.deleteAt(cursor);
    return true;
  }

  public deleteAll(element: T) {
    const key = this.getKey(element);
    const h = this.getHash(key);
    const i = h % this._array.length;
    if (this._array[i] === undefined) {
      return 0;
    }
    let deleted = 0;
    for (const cursor of this._array[i].toRange().cursors()) {
      if (this.keysEqual(this.getKey(cursor.value), key)) {
        this._array[i].deleteAt(cursor);
        --this.elementCount;
        ++deleted;
      }
    }
    return deleted;
  }

  public clone(): HashIndex<T, K> {
    return new HashIndex({
      elements: this,
      capacity: this._array.length,
      elementsEqual: this.elementsEqual,
      getHash: this.getHash,
      getKey: this.getKey,
      keysEqual: this.keysEqual,
      onDuplicateElements: this.onDuplicateElements,
      onDuplicateKeys: this.onDuplicateKeys
    })
  }

}

export default HashIndex;
