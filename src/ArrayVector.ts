
import { Vector } from "../interfaces/Vector"

export class ArrayVector<T> implements Vector<T> {

  elements: T[] = []

  add(el: T) {
    this.append(el) 
  }

  remove(el: T) {
    this.removeFirst(el)
  }

  append(el: T) {
    this.elements.push(el)
  }

  prepend(el: T) {
    this.elements.unshift(el)
  }

  removeFirst(el: T) {
    const idx = this.elements.indexOf(el)
    if (idx === -1)
      throw new Error(`${el} not part of vector`)
    this.elements.splice(idx, 1)
  }

  removeLast(el: T) {
    const idx = this.elements.lastIndexOf(el)
    if (idx === -1)
      throw new Error(`${el} not part of vector`)
    this.elements.splice(idx, 1)
  }
}
