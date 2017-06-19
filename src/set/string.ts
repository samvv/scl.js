
import { Set } from "../../interfaces"

export class StringSet implements Set<string> {

  _elements: { [el: string]: boolean } = Object.create(null)

  size() {
    return Object.keys(this._elements).length
  }

  add(el: string) {
    if (this._elements[el] !== undefined)
      throw new Error(`element ${el} already added`)
    this._elements[el] = true
  }

  has(el: string) {
    return this._elements[el] !== undefined
  }

  *iterator(): Iterator<string> {
    for (const el of Object.keys(this._elements))
      yield el
  }

  [Symbol.iterator]() {
    return this.iterator()
  }

  delete(el: string) {
    if (this._elements[el] === undefined)
      throw new Error(`el ${el} not found`)
    delete this._elements[el]
  }

  clear() {
    this._elements = Object.create(null)
  }

}

export default StringSet

