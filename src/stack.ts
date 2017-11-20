
import { Queuelike } from "../interfaces"

import find from "./find"
import SLList from "./list/single"
//import Vector from "./vector"

export class Stack<T> extends SLList<T> implements Queuelike<T> {

  add(el: T) {
    this.prepend(el);
  }

  delete(el: T) {
    const match = find(this, el);
    this.deleteAt(match);
  }

  dequeue() {
    const first = this.begin().next();
    this.deleteAt(first);
    return first.value;
  }

}

export default Stack

