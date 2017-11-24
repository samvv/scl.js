
import { Container, Cursor } from "./interfaces"
import DLList, { Cursor as DLCursor } from "./list/double"
import { DictMode } from "./util"

export type Bucket<T> = DLList<Element<T>>;

export class Element<T> {

  constructor(public value: T, public _index: number) {

  }

  _bucketPos: DLCursor<Element<T>> = null;
  _listPos: DLCursor<Element<T>> = null;

  next() {
    return this._listPos.next();
  }

  prev() {
    return this._listPos.next();
  }

}

class BucketView<T> {

  constructor(public _hash: Hash<T>, public _el: T, public _bucket: DLList<Element<T>>) {
    
  }

  _reversed = false;

  reverse() {
    this._reversed = !this._reversed;   
  }

  *[Symbol.iterator]() {
    if (this._reversed) {
      for (const el of this._bucket) {
        if (this._hash.isEqual(el.value, this._el)) {
          yield el.value;
        }
      }
    } else {
      for (const el of this._bucket) {
        if (this._hash.isEqual(el.value, this._el)) {
          yield el.value;
        }
      }
    }
  }

}

export class Hash<T> implements UnorderedContainer<T> {
  
  _array: Bucket<T>[];
  _list = new DLList<Element<T>>();

  _getConflict(bucket: Bucket<T>, val: T): Element<T> {
    return null;
  }

  constructor(public getHash: (el: T) => number, public isEqual: (a: T, b: T) => boolean, size = 100) {
    this._array = new Array(size);
  }

  equal(el: T) {
    const h = this.getHash(el);
    const i = h % this._array.length;
    return new BucketView(this, el, this._array[i] === undefined ? null : this._array[i]);
  }

  add(val: T) {
    const h = this.getHash(val);
    const i = h % this._array.length;
    if (this._array[i] === undefined) {
      this._array[i] = new DLList<Element<T>>();
    }
    const bucket = this._array[i];
    const conflict = this._getConflict(bucket, val);
    if (conflict !== null) {
      return conflict; 
    }
    const el = new Element(val, i);
    el._bucketPos = bucket.append(el);
    el._listPos = this._list.append(el);
    return el;
  }

  deleteAt(pos: Element<T>) {
    this._array[pos._index].deleteAt(pos._bucketPos);
    this._list.deleteAt(pos._listPos);
  }

  find(val: T): Element<T> {
    const h = this.getHash(val);
    const i = h % this._array.length;
    if (this._array[i] === undefined) {
      return null;
    }
    for (const el of this._array[i]) {
      if (this.isEqual(el.value, val)) {
        return el;
      }
    }
  }

  delete(el: T) {
    const pos = this.find(el);
    if (pos !== null) {
      this.deleteAt(pos);
    }
  }

  *[Symbol.iterator]() {
    for (const el of this._list) 
      yield el.value;
  }

}

export default Hash;

