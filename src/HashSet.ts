
import { ArrayIterator } from "./ArrayIterator"
import { UnorderedContainer } from "../interfaces"

export class HashSet<T> implements UnorderedContainer<T> {

  elements: Object = {}

  iterator(): Iterator<T> {
    const keys = Object.keys(this.elements)
        , set = this
    return new ArrayIterator(keys)
  }

  [Symbol.iterator](): Iterator<T> { 
    return this.iterator()
  }

  isEmpty() {
    return Object.keys(this.elements).length === 0
  }

  clear() {
    this.elements = {}
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

