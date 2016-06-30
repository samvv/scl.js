
import { Pair, Dict } from "../interfaces/Dict"

/**
 * Maps keys to object where keys are separable in several smaller chunks.
 */
export class DeepDict<K, V> implements Dict<K[], V> {

  rootNode: any = {}

  hasKey(path: K[]) {
    let node = this.rootNode
    for (const chunk of path) {
      node = node[chunk]
      if (node === undefined)
        return false
    }
    return true
  }

  hasValue(value: V) {
    throw new Error(`not implemented`)
  }

  get(path: K[]) {
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

