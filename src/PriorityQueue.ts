
import { ArrayHeap } from "./ArrayHeap"

export interface PriorityQueueOptions<T> {
  initSize?: number
  compare?: (a: T, b: T) => boolean
  allocSize?: number
}

export class PriorityQueue<T> {

  heap: ArrayHeap<T>

  constructor(options?: PriorityQueueOptions<T>) {
    options = options || {}
    this.heap = new ArrayHeap(
      options.initSize || 10,
      options.allocSize || 10,
      options.compare || ((a, b) => a < b)
    )
  }

  enqueue(el: T) {
    this.heap.add(el)
  }

  peek() {
    return this.heap.min()
  }

  dequeue() {
    const min = this.heap.min()
    this.heap.removeMin()
    return min
  }

  has(el: T) {
    return this.heap.has(el)
  }

  remove(el: T) {
    this.heap.remove(el)
  }
}
