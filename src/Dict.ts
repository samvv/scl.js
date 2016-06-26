
import { Pair, Dict } from "../interfaces/Dict"

export class Dict<K, V> implements Dict<K, V> {

  elements: { [key: K]: V } = {}

  add(pair: Pair<K, V>) {
    this.addPair(pair.key, pair.value)
  }

  remove(pair: Pair<K, V>) {
    if (!this.elements[pair.key])
      throw new Error(`key '${pair.key}' has no value associated with it`)
    if (this.elements[pair.key] !== pair.value)
      throw new Error(`key '${pair.key}' contains a different value`)
    delete this.elements[pair.key]
  }
  
  addPair(key: K, value: V) {
    if (this.elements[key])
      throw new Error(`key '${key}' already taken`)
    this.elements[key] = value
  }

  removeKey(key: K) {
    if (!this.elements[key])
      throw new Error(`key '${key}' has no value associated with it`)
    delete this.elements[key]
  }

  hasKey(key: K) {
    return this.elements[key] !== undefined
  }

  hasValue(value: V) {
    for (const key of this.elements)
      if (this.elements[key] === value)
        return true
    return false
  }

  removeValues(value: V) {
    for (const key of this.elements)
      if (this.elements[key] === value)
        delete this.elements[key]
  }

}

