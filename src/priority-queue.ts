
import { Queuelike, Cursor } from "./interfaces"
import Heap from "./heap"
import { lesser } from "./util"
import { VectorCursor } from "./vector"

export class PriorityQueue<T> implements Queuelike<T> {
 
  _heap: Heap<T>

  constructor(elements: Iterable<T> = [], compare: (a: T, b: T) => boolean = lesser) {
    this._heap = new Heap<T>(elements, compare)
  }

  get size() {
    return this._heap.size
  }

  deleteAll(el: T) {
    return this._heap.deleteAll(el)
  }

  deleteAt(cursor: VectorCursor<T>) {
    this._heap.deleteAt(cursor);
  }

  peek() {
    return this._heap.min();
  }

  pop() {
    const min = this._heap.min()
    this._heap.deleteMin()
    return min
  }

  has(el: T) {
    return this._heap.has(el)
  }

  add(el: T) {
    return this._heap.add(el)
  }

  delete(el: T) {
    return this._heap.delete(el)
  }

  *[Symbol.iterator]() {
    // FIXME can be optimised? 
    const h = this._heap.clone()
    while (h.size > 0) {
      yield h.min()
      h.deleteMin()
    }
  }

  toRange() {
    return this._heap.toRange();
  }

  clear() {
    this._heap.clear()
  }

}

export default PriorityQueue

