
/// <reference path="../typings/index.d.ts" />

import { ArrayIterator } from "../src/ArrayIterator"
import { UnorderedContainer } from "../interfaces/UnorderedContainer"

export class HashSet<T> implements UnorderedContainer<T> {

  elements: Object = {}

  iterator() {
    const keys = Object.keys(this.elements)
        , set = this
    return new ArrayIterator(keys)
      .map(key => ({ key: key, value: this.elements[key] }))
  }

  [Symbol.iterator]() { 
    return this.iterator()
  }

  add(el: T) {
    if (this.elements[el])
      throw new Error(`set already contains element: ${el}`)
    this.elements[el] = true
  }

  remove(el: T) {
    if (!this.elements[el])
      throw new Error(`set does not contain element: ${el}`)
    delete this.elements[el] 
  }

  has(el: T): boolean {
    return !!this.elements[el]
  }

}

