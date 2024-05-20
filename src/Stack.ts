
import type { Queuelike } from "./interfaces.js";
import { SingleLinkedList } from "./SingleLinkedList.js";

/**
 * A _LIFO queue_, where the last element to be pushed into the queue is the
 * first element to be popped out of it.
 *
 * ```ts
 * import { Stack } from "scl"
 * ```
 *
 * Pushing and popping an element are both in `O(1)`.
 *
 * | Property name                 | Worst-case |
 * |-------------------------------|------------|
 * | {@link Stack.add add()}       | O(1)       |
 * | {@link Stack.peek peek()}     | O(1)       |
 * | {@link Stack.pop pop()}       | O(1)       |
 * | {@link Stack.size size}       | O(1)       |
 *
 * @typeparam T The type of element in this queue.
 *
 * @see [[Queue]]
 * @see [[PriorityQueue]]
 */
export class Stack<T> extends SingleLinkedList<T> implements Queuelike<T> {

  public peek() {
    return this.first();
  }

  public pop() {
    const cursor = this.at(0);
    this.deleteAt(cursor);
    return cursor.value;
  }

}

export default Stack;
