
import { Pair } from "../interfaces/Pair"
import { Pair, MultiDict } from "../interfaces/MultiDict"

export class HashMultiDict<K, V> implements MultiDict<K, V> {

  elements: { [key: K]: Set<V> } = {}

  add(pair: Pair<K, V>) {
    this.addPair(pair.key, pair.value)
  }

  addPair(key: K, value: V) {
    if (!this.elements[key])
      this.elements[key] = new HashSet<V>()
    this.elements[key].add(value)
  }

  has(pair: Pair<K, V>) {
    const set = this.elements[pair.key]
    if (!set)
      return false
    return set.has(pair.value)
  }

  isEmpty() {
    return Object.keys(this.elements).length === 0
  }

  clear() {
    this.elements = {}
  }

  hasKeys(key: K) {
    return !!this.elements[key]
  }

  hasValues(value: V) {
    for (const key of this.elements) {
      const set = this.elements[key]
      for (const val of set)
        if (value === val)
          return true
    }
    return false
  }

  remove(pair: Pair<K, V>) {
    this.remove(pair.key, pair.value)
  }

  removePair(key: K, value: V) {
    const set = this.elements[key]
    if (!set)
      throw new Error(`key ${key} not found in dictionary`)
    set.remove(value)
    if (set.isEmpty())
      delete this.elements[key]
  }
}

