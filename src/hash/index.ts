
import { KeyedCollection, CollectionRange, Cursor, List } from "../interfaces"
import DoubleLinkedList, { DoubleLinkedListRange, DoubleLinkedListCursor } from "../list/double"
import { RangeBase } from "../util"

/**
 * @ignore
 */
export type Bucket<T> = DoubleLinkedList<T>;

/**
 * @ignore
 */
export class HashCursor<T> implements Cursor<T> {

  constructor(public _bucket: Bucket<T>, public _bucketPos: DoubleLinkedListCursor<T>) {

  }

  get value() {
    return this._bucketPos.value;
  }

  set value(newVal: T) {
    this._bucketPos.value = newVal;
  }

}

class EmptyRange<T> implements CollectionRange<T> {
  filter(pred: (el: Cursor<T>) => boolean) { return this; }
  reverse() { return this; }
  get size() { return 0; }
  *values(): IterableIterator<T> {  }
  *[Symbol.iterator](): IterableIterator<Cursor<T>> {  }
}

class BucketRange<T> extends RangeBase<T> implements CollectionRange<T> {

  constructor(public _bucket: Bucket<T>, public _range: DoubleLinkedListRange<T>) {
    super();
  }

  reverse() {
    return new BucketRange(this._bucket, this._range.reverse());
  }

  get size() {
    return this._range.size;
  }

  values() {
    return this._range.values();
  }

  *[Symbol.iterator]() {
    for (const cursor of this._range) {
      yield new HashCursor<T>(this._bucket, cursor);
    }
  }

}

class HashRange<T, K> implements CollectionRange<T> {

  constructor(public _hash: Hash<T, K>) {

  }

  get size() {
    return this._hash.size;
  }

  *values() {
    for (const bucket of this._hash._array) {
      if (bucket !== undefined) {
        for (const element of bucket) {
          yield element;
        }
      }
    }
  }

  *[Symbol.iterator]() {
    for (const bucket of this._hash._array) {
      if (bucket !== undefined) {
        for (const cursor of bucket.toRange()) {
          yield new HashCursor(bucket, cursor);
        }
      }
    }
  }

}

/**
 * A hash is a low-level collection upon which more complex collections may be
 * built, such as a {@link Dict dictionary}.
 *
 * ```ts
 * import Hash from "scl/hash"
 * ```
 *
 * All methods in this collection, given that a proper hashing function is set
 * up, are in `O(1)`.
 *
 * @typeparam T The type of elements in the collection.
 * @typeparam K The type of the element's key.
 */
export class Hash<T, K = T> implements KeyedCollection<T, K> {

  /**
   * @ignore
   */
  _array: Bucket<T>[];

  /**
   * @ignore
   */
  _size = 0;

  /**
   * @ignore
   */
  _getConflict(bucket: Bucket<T>, value: T): DoubleLinkedListCursor<T> | null {
    return null;
  }

  constructor(
        public getHash: (el: K) => number
      , public keysEqual: (a: K, b: K) => boolean
      , public valuesEqual: (a: T, b: T) => boolean
      , public getKey: (val: T) => K = (val: T) => val as any
      , size = 100) {
    this._array = new Array(size);
  }

  get size() {
    return this._size;
  }

  clear() {
    this._array.splice(0, this._array.length);
  }

  equalKeys(key: K) {
    const bucket = this._getBucket(key);
    if (bucket === null) {
      return new EmptyRange<T>();
    }
    return bucket.toRange()
      .filter((cursor: Cursor<T>) => this.keysEqual(this.getKey(cursor.value), key));
  }

  add(element: T): [boolean, HashCursor<T>] {
    const h = this.getHash(this.getKey(element));
    const i = h % this._array.length;
    let bucket = this._array[i] === undefined
      ? this._array[i] = new DoubleLinkedList<T>()
      : this._array[i];
    const conflict = this._getConflict(bucket, element);
    if (conflict !== null) {
      return [false, new HashCursor<T>(bucket, conflict)]; 
    }
    const bucketPos = bucket.append(element);
    ++this._size;
    return [true, new HashCursor<T>(bucket, bucketPos)];
  }

  deleteAt(cursor: HashCursor<T>) {
    cursor._bucket.deleteAt(cursor._bucketPos);
    --this._size;
  }

  findKey(key: K): HashCursor<T> | null {
    const bucket = this._getBucket(key);
    if (bucket === null) {
      return null;
    }
    for (const cursor of bucket.toRange()) {
      if (this.keysEqual(this.getKey(cursor.value), key)) { 
        return new HashCursor<T>(bucket, cursor);
      }
    } 
    return null;
  }

  find(value: T): HashCursor<T> | null {
    const key = this.getKey(value);
    const bucket = this._getBucket(key);
    if (bucket === null) {
      return null;
    }
    for (const cursor of bucket.toRange()) {
      if (this.keysEqual(this.getKey(cursor.value), key) && this.valuesEqual(cursor.value, value)) { 
        return new HashCursor<T>(bucket, cursor);
      }
    }
    return null;
  }

  has(element: T): boolean {
    for (const cursor of this.equalKeys(this.getKey(element))) {
      if (this.valuesEqual(cursor.value, element)) {
        return true;
      }
    }
    return false;
  }

  hasKey(key: K) {
    return this.findKey(key) !== null;
  }

  /**
   * @ignore
   */
  _getBucket(key: K): Bucket<T> | null {
    const h = this.getHash(key);
    const i = h % this._array.length;
    const bucket = this._array[i];
    if (bucket === undefined) {
      return null;
    }
    return bucket;
  }

  deleteKey(key: K) {
    const bucket = this._getBucket(key);
    if (bucket === null) {
      return 0;
    }
    let deleted = 0;
    for (const cursor of bucket.toRange()) {
      if (this.keysEqual(this.getKey(cursor.value), key)) { 
        bucket.deleteAt(cursor);
        --this._size;
        ++deleted;
      }
    }
    return deleted;
  }

  toRange() {
    return new HashRange<T, K>(this);
  }

  delete(el: T) {
    const pos = this.find(el);
    if (pos === null) {
      return false;
    }
    this.deleteAt(pos);
    return true;
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this._array.length; i++) {
      const bucket = this._array[i];
      if (bucket !== undefined) {
        for (const el of bucket) {
          yield el;
        }
      }
    }
  }

  deleteAll(element: T) {
    const key = this.getKey(element);
    const h = this.getHash(key);
    const i = h % this._array.length;
    if (this._array[i] === undefined) {
      return 0;
    }
    let deleted = 0;
    for (const cursor of this._array[i].toRange()) {
      if (this.keysEqual(this.getKey(cursor.value), key)) { 
        this._array[i].deleteAt(cursor);
        --this._size;
        ++deleted;
      }
    }
    return deleted;
  }

}

export class SingleValueHash<T, K = T> extends Hash<T, K> {

  _getConflict(bucket: Bucket<T>, val: T) {
    const key = this.getKey(val);
    for (const cursor of bucket.toRange()) {
      if (this.keysEqual(this.getKey(cursor.value), key) && this.valuesEqual(cursor.value, val)) {
        return cursor;
      }
    }
    return null;
  }

}

export class SingleKeyHash<T, K = T> extends Hash<T, K> {

  _getConflict(bucket: Bucket<T>, value: T) {
    const key = this.getKey(value);
    for (const cursor of bucket.toRange()) {
      if (this.keysEqual(this.getKey(cursor.value), key)) {
        cursor.value = value;
        return cursor; 
      }
    }
    return null;
  }

}

export default Hash;

