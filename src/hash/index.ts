
import { IndexedCollection, CollectionRange, Cursor } from "../interfaces"
import DoubleLinkedList, { DoubleLinkedListCursor } from "../list/double"
import { RangeBase, EmptyRange } from "../util"

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

const DEFAULT_BUCKET_COUNT = 255;

class HashRange<T, K> extends RangeBase<T> {

  constructor(protected _hash: Hash<T, K>) {
    super();
  }

  get size() {
    return this._hash.size;
  }

  *[Symbol.iterator]() {
    for (const bucket of this._hash._array) {
      if (bucket !== undefined) {
        for (const element of bucket) {
          yield element;
        }
      }
    }
  }

  *cursors() {
    for (const bucket of this._hash._array) {
      if (bucket !== undefined) {
        for (const cursor of bucket.toRange().cursors()) {
          yield new HashCursor(bucket, cursor);
        }
      }
    }
  }

}

/**
 * @ignore
 */
export abstract class Hash<T, K = T> implements IndexedCollection<T, K> {

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
  constructor(
        /** @ignore */ public getHash: (el: K) => number
      , /** @ignore */ public keysEqual: (a: K, b: K) => boolean
      , /** @ignore */ public elementsEqual: (a: T, b: T) => boolean
      , /** @ignore */ public getKey: (val: T) => K = (val: T) => val as any
    , capacity = DEFAULT_BUCKET_COUNT) {
    this._array = new Array(capacity);
  }

  protected abstract _getConflict(bucket: Bucket<T>, element: T): DoubleLinkedListCursor<T> | null;

  get size() {
    return this._size;
  }

  clear() {
    this._array.splice(0, this._array.length);
    this._size = 0;
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
    for (const cursor of bucket.toRange().cursors()) {
      if (this.keysEqual(this.getKey(cursor.value), key)) { 
        return new HashCursor<T>(bucket, cursor);
      }
    } 
    return null;
  }

  has(element: T): boolean {
    for (const cursor of this.equalKeys(this.getKey(element)).cursors()) {
      if (this.elementsEqual(cursor.value, element)) {
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
    for (const cursor of bucket.toRange().cursors()) {
      if (this.keysEqual(this.getKey(cursor.value), key)) { 
        bucket.deleteAt(cursor);
        --this._size;
        ++deleted;
      }
    }
    return deleted;
  }

  [Symbol.iterator]() {
    return this.toRange()[Symbol.iterator]();
  }

  toRange() {
    return new HashRange<T, K>(this);
  }

  delete(el: T) {
    const cursor = this.findKey(this.getKey(el));
    if (cursor === null || !this.elementsEqual(el, cursor.value)) {
      return false;
    }
    this.deleteAt(cursor);
    return true;
  }

  deleteAll(element: T) {
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
        --this._size;
        ++deleted;
      }
    }
    return deleted;
  }

  abstract clone(): Hash<T, K>;

}

export default Hash;
