
import { Cursor } from "../interfaces"
import { Hash, HashCursor } from "../hash"
import { digest } from "json-hash"
import { equal } from "../util"

export class HashDict<K, V> {

  _hash: Hash<[K, V]>;

  constructor(getHash: (el: K) => number = digest
      , public isEqual: (a: K, b: K) => boolean = equal
      , public valuesEqual = equal) {
    this._hash = new Hash((el: [K, V]) => getHash(el[0]), (a: [K, V], b: [K, V]) => isEqual(a[0], b[0]));
  }

  add(pair: [K, V]) {
    return this._hash.insert(pair);
  }

  getValue(key: K) {
    const vs = [...this._hash.equal([key, null])];
    if (vs.length > 0) {
      return vs[0][1];
    }
  }

  has(pair: [K, V]) {
    for (const other of this._hash.equal(pair)) {
      if (this.valuesEqual(pair[1], other[1])) {
        return true;
      }
    }
    return false;
  }

  [Symbol.iterator]() {
    return this._hash[Symbol.iterator]();
  }

  emplace(key: K, value: V) {
    this.add([key, value]);
  }

  deleteAt(pos: Cursor<[K, V]>) {
    this._hash.remove(pos);
  }

}

export default HashDict;

