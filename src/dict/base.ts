
import { Cursor, UnorderedContainer } from "../interfaces"

export class DictBase<K, V> {

  _data: UnorderedContainer<[K, V]>;

  constructor(public valuesEqual: (a: V, b: V) => boolean) {

  }

  add(pair: [K, V]) {
    return this._data.add(pair);
  }

  getValue(key: K) {
    const vs = [...this._data.equal([key, null])];
    if (vs.length > 0) {
      return vs[0][1];
    }
  }

  has(pair: [K, V]) {
    for (const other of this._data.equal(pair)) {
      if (this.valuesEqual(pair[1], other[1])) {
        return true;
      }
    }
    return false;
  }

  [Symbol.iterator]() {
    return this._data[Symbol.iterator]();
  }

  emplace(key: K, value: V) {
    this.add([key, value]);
  }

  deleteAt(pos: Cursor<[K, V]>) {
    this._data.deleteAt(pos);
  }

}

export default DictBase;

