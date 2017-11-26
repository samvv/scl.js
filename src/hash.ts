
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

class BucketView<T, K> {

  constructor(public _hash: Hash<T, K>, public _key: K, public _bucket: Bucket<T>, public _reversed = false) {
    
  }

  reverse() {
    return new BucketView<T, K>(this._hash, this._key, this._bucket, !this._reversed);
  }

  *[Symbol.iterator]() {
    const getKey = this._hash.getKey;
    if (this._reversed) {
      for (const val of this._bucket) {
        if (this._hash.keysEqual(getKey(val), this._key)) {
          yield val;
        }
      }
    } else {
      for (const val of this._bucket) {
        if (this._hash.keysEqual(getKey(val), this._key)) {
          yield val;
        }
      }
    }
  }

}

export class Hash<T, K = T> implements UnorderedContainer<T> {
  
  _array: Bucket<T>[];
  _size = 0;

  _getConflict(bucket: Bucket<T>, val: T): ListCursor<T> {
    return null;
  }

  constructor(
        public getHash: (el: K) => number
      , public keysEqual: (a: K, b: K) => boolean
      , public valuesEqual: (a: T, b: T) => boolean
      , public getKey = val => val, size = 100) {
    this._array = new Array(size);
  }

  size() {
    return this._size;
  }

  clear() {
    this._array.splice(0, this._array.length);
  }

  equalKeys(key: K) {
    const h = this.getHash(key);
    const i = h % this._array.length;
    return new BucketView<T, K>(this, key, this._array[i] === undefined ? null : this._array[i]);
  }

  add(val: T): [boolean, HashCursor<T>] {
    const h = this.getHash(this.getKey(val));
    const i = h % this._array.length;
    if (this._array[i] === undefined) {
      this._array[i] = new List<T>();
    }
    const bucket = this._array[i];
    const conflict = this._getConflict(bucket, val);
    if (conflict !== null) {
      return [false, new HashCursor<T>(i, conflict)]; 
    }
    const bucketPos = bucket.append(val);
    ++this._size;
    return [true, new HashCursor<T>(i, bucketPos)];
  }

  deleteAt(pos: HashCursor<T>) {
    this._array[pos._bucketIndex].deleteAt(pos._bucketPos);
    --this._size;
  }

  findKey(key: K): HashCursor<T> {
    const getKey = this.getKey;
    const h = this.getHash(key);
    const i = h % this._array.length;
    if (this._array[i] === undefined) {
      return null;
    }
    let curr = this._array[i].begin();
    while (curr !== null) {
      if (this.keysEqual(getKey(curr.value), key)) { 
        return new HashCursor<T>(i, curr);
      }
      curr =  curr.next();
    } 
    return null;
  }

  find(val: T): HashCursor<T> {
    const getKey = this.getKey;
    const key = getKey(val);
    const h = this.getHash(key);
    const i = h % this._array.length;
    if (this._array[i] === undefined) {
      return null;
    }
    let curr = this._array[i].begin();
    while (curr !== null) {
      if (this.keysEqual(getKey(curr.value), key) && this.valuesEqual(curr.value, val)) { 
        return new HashCursor<T>(i, curr);
      }
      curr =  curr.next();
    } 
    return null;
  }

  has(val: T) {
    return this.find(val) !== null;
  }

  hasKey(key: K) {
    return this.findKey(key) !== null;
  }

  deleteKey(key: K) {
    const getKey = this.getKey;
    const h = this.getHash(key);
    const i = h % this._array.length;
    if (this._array[i] === undefined) {
      return null;
    }
    let curr = this._array[i].begin(), deleted = 0;
    while (curr !== null) {
      if (this.keysEqual(getKey(curr.value), key)) { 
        // inlined from deleteAt
        this._array[i].deleteAt(curr);
        ++deleted;
        --this._size;
      }
      curr =  curr.next();
    } 
    return deleted;
  }

  delete(el: T) {
    const pos = this.find(this.getKey(el));
    if (pos !== null) {
      this.deleteAt(pos);
    }
  }

}


export default Hash;

