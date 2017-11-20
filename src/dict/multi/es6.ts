
import { Pair, MultiDict } from "../../../interfaces"

export class ESMultiDict<K, V> implements MultiDict<K, V> {
  
  _size = 0;
  _map = new Map<K, Set<V>>()

  add([key, val]) {
    this.addPair(key, val)
  }

  size() {
    return this._size;
  }

  count([key, value]: Pair<K, V>) {
    const s = this._map.get(key)
    if (s === undefined)
      return 0
    return s.has(value) ? 1 : 0
  }

  has(pair: Pair<K, V>) {
    return this.hasKey(pair[0])
  }

  hasKey(key: K) {
    return this._map.has(key)
  }

  getValue(key: K) {
    if (!this._map.has(key))
      throw new Error(`key ${key} not found`)
    return this._map.get(key)
  }

  getValues(key: K) {
    const s = this._map.get(key)
    if (s === undefined)
      throw new Error(`key ${key} not found`)
    return [...s]
  }

  addPair(key: K, value: V) {
    if (!this._map.has(key))
      this._map.set(key, new Set<V>())
    const s = this._map.get(key)
    if (!s.has(value)) {
      s.add(value)
      ++this._size;
    }
  }

  hasValue(val: V) {
    for (const s of this._map.values())
     if (s.has(val))
       return true
    return false
  }

  *iterator(): Iterator<Pair<K, V>> {
    for (const [key, s] of this._map)
      for (const val of s)
        yield [key, val]
  }

  [Symbol.iterator]() {
    return this.iterator()
  }

  clear() {
    this._map.clear()
    this._size = 0;
  }

  deleteValue(val: V) {
    for (const [key, s] of this._map) {
      if (s.has(val)) {
        s.delete(val)
        --this._size;
        break
      }
    }
  }

  deleteValues(val: V) {
    for (const [key, s] of this._map) {
      if (s.has(val)) {
        s.delete(val);
        --this._size;
      }
    }
  }

  deleteAll([key, val]: Pair<K, V>) {
    const s = this._map.get(key)
    if (s === undefined)
      return
    if (s.has(val)) {
      s.delete(val)
      --this._size;
    }
  }

  deleteKeys(key: K) {
    if (this._map.has(key)) {
      this._size -= this._map.get(key).size;
      this._map.delete(key)
    }
  }

  delete([key, value]: Pair<K, V>) {
    const s = this._map.get(key)
    if (s === undefined)
      throw new Error(`key ${key} not found`)
    if (!s.has(value))
      throw new Error(`value ${value} not found`)
    if (s.has(value)) {
      --this._size;
      s.delete(value)
    }
  }

}

