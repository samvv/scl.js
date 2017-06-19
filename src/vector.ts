
import { Iterator, Vector } from "../interfaces"

interface ArrIteratorResult<T> extends IteratorResult<T> {
  _idx: number
}

export class ArrIterator<T> implements Iterator<T> {
  
  constructor(public _arr: T[], public _idx: number) {

  }

  next() {
    if (this._idx >= this._arr.length)
      return { done: true, _idx: -1, value: undefined }
    const res = { done: false, _idx: this._idx, value: this._arr[this._idx] }
    ++this._idx
    return res
  }

}

export class ArrayVector<T> implements Vector<T> {

  protected _elements: T[] = []

  has(el: T) {
    return this._elements.indexOf(el) !== -1
  }

  count(el: T) {
    let res = 0
    for (const othEl of this._elements)
      if (othEl === el) 
        ++res
    return res
  }

  size() {
    return this._elements.length
  }

  insertAfter(pos: IteratorResult<T>, el: T) {
    this._elements.splice((<ArrIteratorResult<T>>pos)._idx+1, 0, el)
  }

  insertBefore(pos: IteratorResult<T>, el: T) {
    this._elements.splice((<ArrIteratorResult<T>>pos)._idx, 0, el)
  }

  first() {
    if (this._elements.length === 0)
      throw new Error(`container is empty`)
    return this._elements[0]
  }

  last() {
    if (this._elements.length === 0)
      throw new Error(`container is empty`)
    return this._elements[this._elements.length-1]
  }

  begin() {
    return new ArrIterator(this._elements, 0)
  }

  end() {
    return new ArrIterator(this._elements, this._elements.length)
  }

  prepend(el: T) {
    this._elements.unshift(el)
  }

  append(el: T) {
    this._elements.push(el)
  }

  [Symbol.iterator]() {
    return this._elements[Symbol.iterator]()
  }
  
  iterator() {
    return this._elements[Symbol.iterator]()
  }

  add(el: T) {
    this._elements.push(el)
  }

  at(count: number) {
    if (count > this._elements.length)
      throw new Error(`invalid range`)
    return {
      done: false,
      value: this._elements[count],
      _idx: count
    }
  }

  delete(el: T) {
    const idx = this._elements.indexOf(el)
    this._elements.splice(idx, 1)
  }

  deleteAll(el: T) {
    this._elements = this._elements.filter(otherEl => el === otherEl)
  }

  clear() {
    this._elements.splice(0, this._elements.length)
  }

}

export default ArrayVector

