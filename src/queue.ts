
import { Queuelike } from "./interfaces"

import find from "./find"
import List from "./list/single"

export class Queue<T> extends List<T> implements Queuelike<T> {

  dequeue() {
    const first = this.begin();
    if (first === null)
      throw new RangeError(`queue is empty`);
    this.deleteAt(first);
    return first.value;
  }

  delete(el: T) {
    const match = find(this, el);
    if (match !== null) {
      this.deleteAt(match);
    }
  }

  add(el: T) {
    this.append(el);
  }

}

export default Queue;

