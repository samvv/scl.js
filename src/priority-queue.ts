
import { Queuelike } from "./interfaces"
import Heap, { HeapOptions } from "./heap"

import { VectorCursor } from "./vector"

export type PriorityQueueOptions<T> = HeapOptions<T>;

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
  constructor(public _heap: Heap<T>) {
  
  }

  /**
   * Creates a new priority queue filled with the given elements.
   */
  static from<T>(iterable: Iterable<T>, opts: PriorityQueueOptions<T> = {}) {
    return new PriorityQueue<T>(Heap.from<T>(iterable, opts));
  }

  static empty<T>(opts: PriorityQueueOptions<T> = {}) {
    return new PriorityQueue<T>(Heap.empty<T>(opts));
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

  clone() {
    return new PriorityQueue(this._heap.clone());
  }

}

export default PriorityQueue

