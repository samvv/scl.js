
import { Pair, Dict } from "../interfaces/Dict"

export class Dict<K, V> implements Dict<K, V> {

  stored: { [key: K]: V } = {}

  add(pair: Pair<K, V>) {
    if (this.stored[pair.key])
      throw new Error(`pair already exists`)
    this.stored[pair.key] = pair.value
  }

  remove(pair: Pair<K, V>) {
    if (!this.stored[pair.key])
      throw new Error(`key not found`)
    if (this.stored[pair.key] !== pair)
      throw new Error(`trying to remove a different pair with the same key`)
    delete this.stored[pair.key]
  }

  removeKey(key: K) {
    if (!this.stored[key])
      throw new Error(`key '${key}' not found`)
    delete this.stored[key]
  }

  hasKey(key: K) {
    return this.stored[key] !== undefined
  }

  hasValue(value: V) {
    for (const key of this.stored)
      if (this.stored[key] === value)
        return true
    return false
  }
}

