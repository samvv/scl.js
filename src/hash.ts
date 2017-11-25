
import { UnorderedContainer, Cursor } from "./interfaces"
import List, { Cursor as ListCursor } from "./list/double"

export type Bucket<T> = List<T>;

class HashCursor<T> implements Cursor<T> {

  constructor(public _bucketIndex: number, public _bucketPos: ListCursor<T>) {

  }

  get value() {
    return this._bucketPos.value;
  }

  set value(newVal: T) {
    this._bucketPos.value = newVal;
  }

}

export { HashCursor as Cursor };

class BucketView<T> {

  constructor(public _hash: Hash<T>, public _val: T, public _bucket: Bucket<T>, public _reversed = false) {
    
  }

  reverse() {
    return new BucketView<T>(this._hash, this._val, this._bucket, !this._reversed);
  }

  *[Symbol.iterator]() {
    if (this._reversed) {
      for (const val of this._bucket) {
        if (this._hash.isEqual(val, this._val)) {
          yield val;
        }
      }
    } else {
      for (const val of this._bucket) {
        if (this._hash.isEqual(val, this._val)) {
          yield val;
        }
      }
    }
  }

}

export class Hash<T> implements UnorderedContainer<T> {
  
  _array: Bucket<T>[];
  _size = 0;

  _getConflict(bucket: Bucket<T>, val: T): HashCursor<T> {
    return null;
  }

  constructor(public getHash: (el: T) => number, public isEqual: (a: T, b: T) => boolean, size = 100) {
    this._array = new Array(size);
  }

  size() {
    return this._size;
  }

  clear() {
    this._array.splice(0, this._array.length);
  }

  equal(el: T) {
    const h = this.getHash(el);
    const i = h % this._array.length;
    return new BucketView(this, el, this._array[i] === undefined ? null : this._array[i]);
  }

  add(val: T): [boolean, HashCursor<T>] {
    const h = this.getHash(val);
    const i = h % this._array.length;
    if (this._array[i] === undefined) {
      this._array[i] = new List<T>();
    }
    const bucket = this._array[i];
    const conflict = this._getConflict(bucket, val);
    if (conflict !== null) {
      return [false, conflict]; 
    }
    const bucketPos = bucket.append(val);
    return [true, new HashCursor<T>(i, bucketPos)];
  }

  deleteAt(pos: HashCursor<T>) {
    this._array[pos._bucketIndex].deleteAt(pos._bucketPos);
  }

  find(val: T): HashCursor<T> {
    const h = this.getHash(val);
    const i = h % this._array.length;
    if (this._array[i] === undefined) {
      return null;
    }
    let curr = this._array[i].begin();
    do {
      if (curr === null)
        return null;
      curr =  curr.next();
    } while (!this.isEqual(val, curr.value)) 
    return new HashCursor<T>(i, curr);
  }

  has(val: T) {
    return this.find(val) !== null;
  }

  delete(el: T) {
    const pos = this.find(el);
    if (pos !== null) {
      this.deleteAt(pos);
    }
  }

}

export default Hash;

