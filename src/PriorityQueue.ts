
import Heap, { HeapOptions } from "./Heap";
import { Queuelike } from "./interfaces";
import { isIterable, lessThan as defaultLessThan, omit } from "./util";
import { Vector, VectorCursor } from "./Vector";
// import { DEFAULT_VECTOR_CAPACITY, DEFAULT_VECTOR_ALLOC_STEP } from "./constants"

export type PriorityQueueOptions<T> = HeapOptions<T>;

/**
 * A queue that pops element based on their given priority.
 *
 * ```ts
 * import { PriorityQueue } from "scl"
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
    let iterable: Iterable<T> = [];
    if (isIterable(opts)) {
      iterable = opts;
      opts = {}
    }
    const lessThan = opts.compare ?? defaultLessThan;
    const vector = new Vector<T>(omit(opts, "elements"));
    this._heap = new Heap<T>(vector, lessThan);
    for (const element of iterable) {
      this._heap.add(element);
    }
  }

  get size() {
    return this._heap.size;
  }

  public has(element: T) {
    return this._heap._vector.has(element);
  }

  public deleteAtIndex(index: number) {
    this._heap.deleteAtIndex(index);
  }

  public delete(element: T) {
    return this._heap.delete(element);
  }

  public deleteAt(cursor: VectorCursor<T>) {
    this._heap.deleteAt(cursor);
  }

  public deleteAll(element: T) {
    return this._heap.deleteAll(element);
  }

  public add(element: T) {
    return this._heap.add(element);
  }

  public peek() {
    return this._heap.min();
  }

  public pop() {
    const min = this._heap.min();
    this._heap.deleteMin();
    return min;
  }

  public *[Symbol.iterator]() {
    // FIXME can this be optimised?
    const h = this._heap.clone();
    while (h.size > 0) {
      yield h.min();
      h.deleteMin();
    }
  }

  public toRange() {
    return this._heap._vector.toRange();
  }

  public clear() {
    this._heap._vector.clear();
  }

  public clone(): PriorityQueue<T> {
    return new PriorityQueue<T>(this._heap.clone());
  }

}

export default PriorityQueue;
