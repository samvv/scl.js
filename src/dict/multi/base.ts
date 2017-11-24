
import { View, Cursor, UnorderedContainer } from "../../interfaces"

export class ValueView<V> {

  constructor(public _parent: View<V>) {

  }

  reverse() {
    this._parent = this._parent.reverse();
  }

  *[Symbol.iterator]() {
    for (const pair of this._parent) {
      yield pair[1];
    }
  }

}

export class DictBase<K, V> {

  _data: UnorderedContainer<[K, V]>;

  constructor(public valuesEqual: (a: V, b: V) => boolean) {

  }

  add(pair: [K, V]) {
    return this._data.add(pair);
  }

  getValues(key: K) {
    return new ValueView(this._data.equal([key, null]));
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

  deleteKey(key: K) {
    this._data.delete([key, null]);
  }

  deleteAt(pos: Cursor<[K, V]>) {
    this._data.deleteAt(pos);
  }

}

export default DictBase;

