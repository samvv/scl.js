
import { Queuelike, Cursor } from "./interfaces"

import DoubleLinkedList from "./list/double"

export class Queue<T> extends DoubleLinkedList<T> implements Queuelike<T> {

  peek() {
    return this.first();
  }

  pop() {
    const cursor = this.at(0);
    this.deleteAt(cursor);
    return cursor.value;
  }

  add(el: T): [boolean, Cursor<T>] {
    return [true, this.append(el)];
  }

}

export default Queue;

