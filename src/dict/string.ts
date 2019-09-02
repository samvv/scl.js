
import { Pair, Dict, Cursor, CollectionRange } from "../interfaces"

class ObjectCursor<V> implements Cursor<[string, V]> {
  
  constructor(public _dict: StringDict<V>, public key: string) {

  }

  get value() {
    return [this.key, this._dict._values[this.key]];
  }

  set value(newValue: [string, V]) {
    this._dict._values[this.key] = newValue[1];
  }

}

class ObjectRange<V> implements CollectionRange<[string, V]> {

  constructor(public _dict: StringDict<V>) {

  }

  get size() {
    return this._dict.size;
  }

  values() {
    return this._dict[Symbol.iterator]();
  }

  *[Symbol.iterator]() {
    for (const key of Object.keys(this._dict._values)) {
      yield new ObjectCursor<V>(this._dict, key);
    }
  }

}

export class StringDict<V> implements Dict<string, V> {

  _values: { [key: string]: V } = Object.create(null)

  add([key, val]: Pair<string, V>) {
    return this.emplace(key, val)
  }

  get size() {
    return Object.keys(this._values).length
  }

  has(pair: Pair<string, V>) {
    return this.hasKey(pair[0])
  }

  emplace(key: string, value: V): [boolean, Cursor<[string, V]>] {
    if (this._values[key] !== undefined) {
      return [false, new ObjectCursor<V>(this, key)];
    }
    this._values[key] = value;
    return [true, new ObjectCursor<V>(this, key)];
  }

  hasValue(val: V) {
    for (const key of Object.keys(this._values)) {
      const otherVal = this._values[key]
      if (otherVal === val)
        return true
    }
    return false
  }

  getValue(key: string) {
    const value = this._values[key]
    if (value === undefined)
      throw new Error(`key ${key} not found`)
    return value
  }

  hasKey(key: string) {
    return this._values[key] !== undefined
  }

  *[Symbol.iterator](): IterableIterator<[string, V]> {
    for (const key of Object.keys(this._values)) {
      yield [key, this._values[key]]
    }
  }

  delete(pair: Pair<string, V>) {
    if (!Object.prototype.hasOwnProperty.call(this._values, pair[0])) {
      return true;
    }
    delete this._values[pair[0]];
    return false;
  }

  deleteKey(key: string) {
    if (!Object.prototype.hasOwnProperty.call(this._values, key)) {
      return 0;
    }
    delete this._values[key];
    return 1;
  }

  findKey(key: string) {
    return new ObjectCursor<V>(this, key);
  }

  deleteValue(value: V) {
    for (const key of Object.keys(this._values)) {
      const otherValue = this._values[key]
      if (value === otherValue)
        delete this._values[key]
    }
  }

  deleteAt(cursor: ObjectCursor<V>) {
    delete this._values[cursor.key]
  }

  deleteAll(element: [string, V]) {
    let count = 0;
    for (const key of Object.keys(this._values)) {
      if (key === element[0] && this._values[key] === element[1]) {
        delete this._values[key];
        count++;
      }
    }
    return count;
  }

  toRange() {
    return new ObjectRange<V>(this);
  }

  clear() {
    this._values = Object.create(null)
  }

}

export default StringDict

