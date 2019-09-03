
import { Queuelike, Cursor } from "./interfaces"

import DoubleLinkedList from "./list/double"

/**
 * A _FIFO queue_, where the first element pushed into the collection is also
 * the first to be popped out of it.
 *
 * ```ts
 * import Queue from "scl/queue"
 * ```
 *
 * Pushing and popping an element are both in `O(1)`.
 *
 * The following table summarises the time complexity of the most commonly used
 * properties.
 *
 * | Property name                 | Worst-case |
 * |-------------------------------|------------|
 * | {@link Queue.add add()}       | O(1)       |
 * | {@link Queue.peek peek()}     | O(1)       |
 * | {@link Queue.pop pop()}       | O(1)       |
 * | {@link Queue.size size}       | O(1)       |
 *
 * @typeparam T The type of element in this queue.
 *
 * @see [[Stack]]
 * @see [[PriorityQueue]]
 */
export class Queue<T> extends DoubleLinkedList<T> implements Queuelike<T> {

  static from<T>(iterable: Iterable<T>) {
    const queue = new Queue<T>();
    for (const element of iterable) {
      queue.add(element);
    }
    return queue;
  }

  static empty<T>() {
    return new Queue<T>();
  }

  /**
   * This method's time complexity is in `O(1)`.
   */
  peek() {
    return this.first();
  }

  /**
   * This method's time complexity is in `O(1)`.
   */
  pop() {
    const cursor = this.at(0);
    this.deleteAt(cursor);
    return cursor.value;
  }

  /**
   * This method's time complexity is in `O(1)`.
   */
  add(el: T): [boolean, Cursor<T>] {
    return [true, this.append(el)];
  }

}

export default Queue;

