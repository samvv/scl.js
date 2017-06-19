
import UnorderedContainer from "./Unordered"
import MultiContainer from "./Multi"

/**
 * Queuelike structures hold their data in an order that is determined by the
 * structure itself rather than the end-user.
 *
 * The order the queuelike structure keeps track of its data is always of
 * significance to the user. This is contrary to the order with which
 * dictionaries and sets keep track of data, which does not matter to the end
 * user.
 */
export interface Queuelike<T> extends UnorderedContainer<T>, MultiContainer<T> {
  /**
   * Gets the next element in the order of the queue and removes it from the container.
   *
   * This method is very similar to `first()` except that it mutates the container.
   */
  dequeue(): T
}

