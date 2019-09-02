
import { Queuelike, Cursor } from "./interfaces"
import Heap from "./heap"
import { lesser } from "./util"
import { VectorCursor } from "./vector"

/**
 * A queue that pops element based on their given priority.
 *
 * ```ts
 * import PriorityQueue from "scl/priority-queue"
 * ```
 *
 * The queue will return elements with a lower priority first. If you want the
 * reverse, simply invert the function that is used to compare two elements.
 *
 * The following table summarises the time complexity of the most commonly used
 * properties.
 *
 * | Property name                         | Worst-case |
 * |---------------------------------------|------------|
 * | {@link PriorityQueue.add add()}       | O(log(n))  |
 * | {@link PriorityQueue.peek peek()}     | O(1)       |
 * | {@link PriorityQueue.pop pop()}       | O(log(n))  |
 * | {@link PriorityQueue.size size}       | O(1)       |
 *
 * @see [[Queue]]
 * @see [[Stack]]
 */
export class PriorityQueue<T> implements Queuelike<T> {

  /** 
   * @ignore
   */
  _heap: Heap<T>

  constructor(compare: (a: T, b: T) => boolean = lesser) {
    this._heap = new Heap<T>([], compare)
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

