
import { Queuelike } from "../interfaces"

import find from "./find"
import SLList from "./list/single"

export class Queue<T> extends SLList<T> implements Queuelike<T> {

  dequeue() {
    const first = this.begin().next();
    this.deleteAt(first);
    return first.value;
  }

  delete(el: T) {
    const match = find(this, el);
    this.deleteAt(match);
  }

  add(el: T) {
    this.append(el);
  }

}

export default Queue;

