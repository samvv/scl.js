
import { Iterator, UnorderedContainer  } from "../interfaces"
import { ArrayIterator } from "./ArrayIterator"

export class StringSet implements UnorderedContainer<string> {

  elements: { [element: string]: boolean } = {}

  iterator(): Iterator<string> {
    const keys = Object.keys(this.elements)
    return new ArrayIterator(keys)
  }

  [Symbol.iterator](): Iterator<string> { 
    return this.iterator()
  }

  isEmpty() {
    return Object.keys(this.elements).length === 0
  }

  clear() {
    this.elements = {}
  }

  add(el: string) {
    if (this.elements[el])
      throw new Error(`set already contains element: ${el}`)
    this.elements[el] = true
  }

  remove(el: string) {
    if (!this.elements[el])
      throw new Error(`set does not contain element: ${el}`)
    delete this.elements[el] 
  }

  has(el: string): boolean {
    return !!this.elements[el]
  }

  toArray() {
    return Object.keys(this.elements)
  }

}

