
import { Queuelike } from "./interfaces"
import Heap, { HeapOptions } from "./heap"
import { lesser, isIterable, omit } from "./util"
import { Vector, VectorCursor } from "./vector"
// import { DEFAULT_VECTOR_CAPACITY, DEFAULT_VECTOR_ALLOC_STEP } from "./constants"

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
 * | {@link PriorityQueue.pop deleteAt()}  | O(log(n))  |
 * | {@link PriorityQueue.peek peek()}     | O(1)       |
 * | {@link PriorityQueue.pop pop()}       | O(log(n))  |
 * | {@link PriorityQueue.size size}       | O(1)       |
 *
 * @see [[Queue]]
 * @see [[Stack]]
 */
export class PriorityQueue<T> implements Queuelike<T> {

  protected _heap: Heap<T>;

  /**
   * Construct a new prioriry queue.
   *
   * ```ts
   * const q = new PriorityQueue<number>({
   *   capacity: 1024,
   *   compare: (a, b) => a < b,
   *   elements: [1, 2, 3]
   * })
   * ```
   */
  constructor(opts: Iterable<T> | HeapOptions<T> = {}) {
    if (isIterable(opts)) {
      this._heap = new Heap<T>(new Vector<T>(), lesser);
      for (const element of opts) {
        this._heap.add(element);
      }
    } else {
      const lessThan = opts.compare !== undefined ? opts.compare : lesser;
      const vector = new Vector<T>(omit(opts, 'elements'));
      this._heap = new Heap<T>(vector, lessThan);
    }
  }

  get size() {
    return this._heap.size;
  }

  has(element: T) {
    return this._heap._vector.has(element);
  }

  deleteAtIndex(index: number) {
    this._heap.deleteAtIndex(index);
  }

  delete(element: T) {
    return this._heap.delete(element);
  }

  deleteAt(cursor: VectorCursor<T>) {
    this._heap.deleteAt(cursor);
  }

  deleteAll(element: T) {
    return this._heap.deleteAll(element);
  }

  add(element: T) {
    return this._heap.add(element);
  }

  peek() {
    return this._heap.min();
  }

  pop() {
    const min = this._heap.min()
    this._heap.deleteMin()
    return min
  }

  *[Symbol.iterator]() {
    // FIXME can this be optimised? 
    const h = this._heap.clone()
    while (h.size > 0) {
      yield h.min();
      h.deleteMin();
    }
  }

  toRange() {
    return this._heap._vector.toRange();
  }

  clear() {
    this._heap._vector.clear();
  }

  clone(): PriorityQueue<T> {
    return new PriorityQueue<T>(this._heap.clone());
  }

}

export default PriorityQueue

