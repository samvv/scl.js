
import { Pair, Dict } from "../interfaces/Dict"

/**
 * Maps keys to object where keys are separable in several smaller chunks.
 */
export class DeepDict<K, V> implements Dict<K[], V> {

  rootNode: any = {};

  [Symbol.iterator]() {
    return this.iterator()
  }

  clear() {
    this.rootNode = {}
  }

  iterator(): Iterator<Pair<K[], V>> {
    return new class {
      next() {
        throw new Error(`not implemented`)
      }
    }
  }

  has(pair: Pair<K[], V>) {
    return this.hasKey(pair.key)
  }

  hasKey(path: K[]) {
    if (!(path instanceof Array))
      return false
    let node = this.rootNode
    for (const chunk of path) {
      node = node[chunk]
      if (node === undefined)
        return false
    }
    return true
  }

  removeValues(value: V) {
    throw new Error(`not implemented`)
  }

  removeKey(path: K[]) {
    let node = this.rootNode
    for (const chunk of path.slice(1)) {
      node = node[chunk]
      if (!node)
        throw new Error(`value not found for ${path}`)
    }
  }

  hasValue(value: V) {
    throw new Error(`not implemented`)
  }
  
  getValue(path: K[]) {
    let node = this.rootNode
    for (const chunk of path) {
      node = node[chunk]
      if (node === undefined)
        throw new Error(`element not found`)
    }
    return node
  }

  add(pair: Pair<K[], V>) {
    this.addPair(pair.key, pair.value)
  }

  addPair(path: K[], el: V) {
    let node = this.rootNode
    for (const chunk of path.slice(0, -1)) {
      if (!node[chunk])
        node[chunk] = {}
      node = node[chunk]
    }
    node[path[path.length - 1]] = el
  }

}

