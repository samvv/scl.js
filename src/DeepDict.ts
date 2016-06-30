
// TODO: add me to http://github.com/samvv/typescript-containers

/**
 * Maps keys to object where keys are separable in several smaller chunks.
 */
export class DeepDict<T> {

  rootNode: any = {}

  has(path: any[]) {
    let node = this.rootNode
    for (const chunk of path) {
      node = node[chunk]
      if (node === undefined)
        return false
    }
    return true
  }

  get(path: any[]) {
    let node = this.rootNode
    for (const chunk of path) {
      node = node[chunk]
      if (node === undefined)
        throw new Error(`element not found`)
    }
    return node
  }

  add(path: any[], el: T) {
    let node = this.rootNode
    for (const chunk of path.slice(0, -1)) {
      if (!node[chunk])
        node[chunk] = {}
      node = node[chunk]
    }
    node[path[path.length - 1]] = el
  }
}

