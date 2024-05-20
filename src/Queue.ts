
import type { Queuelike } from "./interfaces.js";

import DoubleLinkedList, {DoubleLinkedListCursor} from "./DoubleLinkedList.js";

/**
 * A _FIFO queue_, where the first element pushed into the collection is also
 * the first to be popped out of it.
 *
 * ```ts
 * import { Queue } from "scl"
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
 * @see {@link Stack}
 * @see {@link PriorityQueue}
 */
export class Queue<T> extends DoubleLinkedList<T> implements Queuelike<T> {

  public static from<T>(iterable: Iterable<T>) {
    const queue = new Queue<T>();
    for (const element of iterable) {
      queue.add(element);
    }
    return queue;
  }

  public static empty<T>() {
    return new Queue<T>();
  }

  /**
   * This method's time complexity is in `O(1)`.
   */
  public peek() {
    return this.first();
  }

  /**
   * This method's time complexity is in `O(1)`.
   */
  public pop() {
    const cursor = this.at(0);
    this.deleteAt(cursor);
    return cursor.value;
  }

  /**
   * This method's time complexity is in `O(1)`.
   */
  public add(el: T): [boolean, DoubleLinkedListCursor<T>] {
    return [true, this.append(el)];
  }

}

export default Queue;
