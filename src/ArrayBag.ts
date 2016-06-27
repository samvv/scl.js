
/// <reference path="../typings/index.d.ts" />

import { ArrayIterator } from "./ArrayIterator"
import { Bag } from "../interfaces/Bag"

export class ArrayBag<T> implements Bag<T> {

  elements: T[] = []

  add(el: T) { 
    this.elements.push(el)
  }

  [Symbol.iterator]() {
    return this.iterator()
  }

  iterator() {
    return new ArrayIterator(this.elements)
  }

  remove(el: T) {
    let idx = this.elements.indexOf(el)
    if (idx === -1)
      throw new Error(`element ${el} not found in bag`)
    this.elements.splice(idx, 1)
    while ((idx = this.elements.indexOf(el)) !== -1)
      this.elements.splice(idx, 1)
  }

  has(el: T) {
    return this.elements.indexOf(el) !== -1
  }

}


