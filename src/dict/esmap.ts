
import { Pair, Dict } from "../../interfaces"

export class MapDict<K, V> implements Dict<K, V> {
  
  _map = new Map<K, V>()

  add([key, val]) {
    this.addPair(key, val)
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

  addPair(key: K, value: V) {
    if (this._map.has(key))
      throw new Error(`key ${key} already taken`)
    this._map.set(key, value)
  }

  hasValue(val: V) {
    for (const otherVal of this._map.values())
      if (val === otherVal)
        return true
    return false
  }

  *iterator() {
    for (const entry of this._map.entries())
      yield entry 
  }

  [Symbol.iterator]() {
    return this.iterator()
  }

  clear() {
    this._map.clear()
  }

  deleteValue(val: V) {
    for (const [key, otherVal] of this._map.entries())
      if (val === otherVal)
        this._map.delete(key)
  }

  deleteKey(key: K) {
    if (!this._map.has(key))
      throw new Error(`key ${key} not found`)
    this._map.delete(key)
  }

  delete(pair: Pair<K, V>) {
    this.deleteKey(pair[0])
  }

}

