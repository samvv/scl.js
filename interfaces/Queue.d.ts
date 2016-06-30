
import { Container } from "./Container"

/**
 * A queue is a kind of container of which the insertion order is guaranteed to
 * be reversely satisfied.
 */
export interface Queue<T> extends Container<T> {
  /**
   * Add an element to the queue.
   */
  enqueue(el: T)
  /**
   * Get the element that is at the beginning of the queue, but do not remove it.
   */
  peek()
  /**
   * Give the first element of the queue, removing the element in the process.
   */
  dequeue()
}

