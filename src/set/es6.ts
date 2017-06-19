
import { Set } from "../../interfaces"

export class ESSet<T> implements Set<T> {
  
  _set = new Set<T>()

  size() {
    return this._set.size
  }

  has(el: T) {
    return this._set.has(el)
  }

  add(el: T) {
    if (this._set.has(el))
      throw new Error(`el ${el} already taken`)
    this._set.add(el)
  }

  iterator() {
    return this._set[Symbol.iterator]()
  }

  [Symbol.iterator]() {
    return this.iterator()
  }

  clear() {
    this._set.clear()
  }

  delete(el: T) {
    if (!this._set.has(el))
      throw new Error(`el ${el} not found`)
    this._set.delete(el)
  }

}

export default ESSet

