
import { Queuelike } from "./interfaces"

import SingleLinkedList from "./list/single"

export class Stack<T> extends SingleLinkedList<T> implements Queuelike<T> {

  peek() {
    return this.first();
  }

  pop() {
    const cursor = this.at(0);
    this.deleteAt(cursor);
    return cursor.value;
  }

}

export default Stack

