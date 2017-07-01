
import { Iterator, IteratorResult, Vector, UnorderedContainer, MinHeap } from "../interfaces"
import ArrayVector from "./vector"

class HeapIteratorResult<T> implements IteratorResult<T> {

  done = false

  get value() {
    return this.heap._vec.ref(this._idx)
  }

  constructor(public heap: BinaryHeap<T>, private _idx) {
    
  }

  delete() {
    this.heap._deleteAt(this._idx+1)
  }

}

class HeapIterator<T> implements Iterator<T> {

  constructor(public heap: BinaryHeap<T>, private _idx = 0) {

  }

  next()  {
    if (this._idx === this.heap.size())
      return { done: true, value: undefined }
    const res = new HeapIteratorResult(this.heap, this._idx);
    ++this._idx;
    return res
  }

}

export class BinaryHeap<T> implements MinHeap<T> {

  size() {
    return this._vec.size()
  }

  constructor(public compare: (a: T, b: T) => boolean = (a,b) => a < b, public _vec: Vector<T> = new ArrayVector<T>()) {

  }
  
  has(el: T) {
    return this._vec.has(el)
  }

  [Symbol.iterator]() {
    return new HeapIterator(this)
  }

  iterator() {
    return this._vec.iterator()
  }

  isEmpty() {
    return this._vec.size() === 0
  }

  clear() {
    this._vec.clear()
  }

  min() {
    if (this._vec.size() === 0)
      throw new Error(`heap does not contain any elements`)
    return this._vec.first()
  }

  add(el: T) {
    this._vec.append(el)
    this._siftUp(this._vec.size())
  }

  delete(el: T) {
    for (let i = 0; i < this._vec.size(); ++i)
      if (this._vec[i] === el) {
        this._deleteAt(i+1)
        return
      }
    throw new Error(`element ${el} not found`)
  }

  deleteAll(el: T) {
    for (let i = 0; i < this._vec.size(); ++i)
      if (this._vec[i] === el)
        this._deleteAt(i+1)
  }

  deleteMin() {
    this._deleteAt(1)
  }

  private _swap(a: number, b: number) {
    const keep = this._vec.ref(a)
    this._vec.replace(a, this._vec.ref(b))
    this._vec.replace(b, keep)
  }

  _deleteAt(pos: number) {
    this._vec.replace(pos-1, this._vec.ref(this._vec.size()-1))
    this._vec.setSize(this._vec.size()-1)
    if (pos !== 1 && this.compare(this._vec[pos-1], this._vec[Math.floor(pos / 2)-1]))
      this._siftUp(pos)
    else
      this._siftDown(pos)
  }

  private _siftDown(pos) {
    while (true) {
      const left = 2*pos, right = 2*pos+1
      let smallest = pos
      if (left <= this._vec.size() && this.compare(this._vec.ref(left-1), this._vec.ref(smallest-1)))
        smallest = left
      if (right <= this._vec.size() && this.compare(this._vec.ref(right-1), this._vec.ref(smallest-1)))
        smallest = right
      if (smallest !== pos) {
        this._swap(pos-1, smallest-1)
        pos = smallest
      } else
        break
    }
  }

  clone() {
    return new BinaryHeap(this.compare, this._vec.clone())
  }

  private _siftUp(pos: number) {
    let el = this._vec.ref(pos-1)
    while (pos > 1) {
      const parentPos = Math.floor(pos / 2)
      if (!this.compare(this._vec.ref(parentPos-1), this._vec.ref(pos-1))) {
        const keep = this._vec.ref(parentPos-1)
        this._vec.replace(parentPos-1, el)
        this._vec.replace(this._vec.size()-1, keep)
        el = keep
      } else {
        break
      }
      pos = parentPos
    }
  }

}

export default BinaryHeap 

