
import { Queuelike } from "../interfaces"
import Heap from "./heap"

export class PriorityQueue<T> implements Queuelike<T> {
 
  _heap: Heap<T>

  constructor(compare: (a: T, b: T) => boolean) {
    this._heap = new Heap<T>(compare)
  }

  size() {
    return this._heap.size()
  }

  count(val: T) {
    let res = 0
    for (const el of this._heap)
      if (el === val)
        ++res
    return res
  }

  deleteAll(el: T) {
    this._heap.deleteAll(el)
  }

  dequeue() {
    const min = this._heap.min()
    this._heap.deleteMin()
    return min
  }

  has(el: T) {
    return this._heap.has(el)
  }

  add(el: T) {
    this._heap.add(el)
  }

  delete(el: T) {
    this._heap.delete(el)
  }

  [Symbol.iterator]() {
    return this.iterator()
  }

  *iterator() {
    const h = this._heap.clone()
    while (h.size() > 0) {
      yield h.min()
      h.deleteMin()
    }
  }

  clear() {
    this._heap.clear()
  }

}

export default PriorityQueue

