
import Heap, { HeapOptions } from "./Heap.js";
import type { Queuelike } from "./interfaces.js";
import { isIterable, lessThan as defaultLessThan } from "./util.js";
import { Vector, VectorCursor } from "./Vector.js";

export interface PriorityQueueOptions<T> extends HeapOptions<T> {

}

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
 * ## Examples
 * 
 * 
 * @see {@link Queue}
 * @see {@link Stack}
 */
export class PriorityQueue<T> implements Queuelike<T> {

  protected heap: Heap<T>;

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
  constructor(opts: Iterable<T> | Heap<T> | HeapOptions<T> = {}) {
    if (opts instanceof Heap) {
      this.heap = opts;
      return;
    }
    if (isIterable(opts)) {
      opts = { elements: opts }
    }
    const {
      elements = [],
      allocStep,
      capacity,
      compare = defaultLessThan
    } = opts;
    const vector = new Vector<T>({
      allocStep,
      capacity
    });
    this.heap = new Heap<T>(vector, compare);
    for (const element of elements) {
      this.heap.add(element);
    }
  }

  public get size(): number {
    return this.heap.size;
  }

  public has(element: T): boolean {
    return this.heap.vector.has(element);
  }

  public deleteAtIndex(index: number): void {
    this.heap.deleteAtIndex(index);
  }

  public delete(element: T): boolean {
    return this.heap.delete(element);
  }

  public deleteAt(cursor: VectorCursor<T>): void {
    this.heap.deleteAt(cursor);
  }

  public deleteAll(element: T): number {
    return this.heap.deleteAll(element);
  }

  public add(element: T) {
    return this.heap.add(element);
  }

  public peek() {
    return this.heap.min();
  }

  public pop() {
    const min = this.heap.min();
    this.heap.deleteMin();
    return min;
  }

  public *[Symbol.iterator]() {
    // FIXME can this be optimised?
    const h = this.heap.clone();
    while (h.size > 0) {
      yield h.min();
      h.deleteMin();
    }
  }

  public toRange() {
    return this.heap.vector.toRange();
  }

  public clear() {
    this.heap.vector.clear();
  }

  public clone(): PriorityQueue<T> {
    return new PriorityQueue<T>(this.heap.clone());
  }

}

export default PriorityQueue;
