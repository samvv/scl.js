
import { Pair, MultiDict } from "../../../interfaces"

export class ESMultiDict<K, V> implements MultiDict<K, V> {
  
  _map = new Map<K, Set<V>>()

  add([key, val]) {
    this.addPair(key, val)
  }

  size() {
    return this._map.size
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
    s.add(value)
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
  }

  deleteValue(val: V) {
    for (const [key, s] of this._map) {
      if (s.has(val)) {
        s.delete(val)
        break
      }
    }
  }

  deleteValues(val: V) {
    for (const [key, s] of this._map)
      s.delete(val)
  }

  deleteAll([key, val]: Pair<K, V>) {
    const s = this._map.get(key)
    if (s === undefined)
      return
    s.delete(val)
  }

  deleteKeys(key: K) {
    this._map.delete(key)
  }

  delete([key, value]: Pair<K, V>) {
    const s = this._map.get(key)
    if (s === undefined)
      throw new Error(`key ${key} not found`)
    if (!s.has(value))
      throw new Error(`value ${value} not found`)
    s.delete(value)
  }

}

