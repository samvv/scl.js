
import { Cursor } from "./interfaces"
import DLList, { Cursor as DLCursor } from "./list/double"

export class HashCursor<T> {

  constructor(public _listPos: DLCursor<[DLList<T>,DLCursor<T>]>) {

  }

  get value() {
    return this._listPos.value[1].value;
  }

  set value(newVal: T) {
    this._listPos.value[1].value = newVal;
  }

  next() {
    return new HashCursor(this._listPos.next());
  }

  prev() {
    return new HashCursor(this._listPos.next());
  }

}

class BucketView<T> {

  constructor(public _hash: Hash<T>, public _el: T, public _bucket: DLList<T>) {
    
  }

  _reversed = false;

  reverse() {
    this._reversed = !this._reversed;   
  }

  *[Symbol.iterator]() {
    if (this._reversed) {
      let pos = this._bucket.begin();
      do {
        if (this._hash.isEqual(pos.value, this._el)) {
          yield pos.value;
          break;
        }
        pos = pos.next();
      } while (pos !== null);
    } else {
      let pos = this._bucket.begin();
      do {
        if (this._hash.isEqual(pos.value, this._el)) {
          yield pos.value;
          break;
        }
        pos = pos.next();
      } while (pos !== null);
    }
  }

}

export class Hash<T> {
  
  _array: DLList<T>[];
  _list = new DLList<[DLList<T>,DLCursor<T>]>();

  constructor(public getHash: (el: T) => number, public isEqual: (a: T, b: T) => boolean, public size = 100) {
    this._array = new Array(size);          
  }

  equal(el: T) {
    const h = this.getHash(el);
    const i = h % this._array.length;
    return new BucketView(this, el, this._array[i] === undefined ? null : this._array[i]);
  }

  insert(el: T) {
    const h = this.getHash(el);
    const i = h % this._array.length;
    if (this._array[i] === undefined) {
      this._array[i] = new DLList<T>();
    }
    const bpos = this._array[i].append(el);
    const lpos = this._list.append([this._array[i], bpos]);
    return new HashCursor<T>(lpos);
  }

  remove(pos: HashCursor<T>) {
    const [bucket, bucketPos] = pos._listPos.value;
    console.log(pos._listPos);
    this._list.deleteAt(pos._listPos);
    bucket.deleteAt(bucketPos);
  }

  *[Symbol.iterator]() {
    for (const el of this._list) 
      yield el[1];
  }

}

export default Hash;

