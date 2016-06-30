
import { Iterator } from "../interfaces/Iterator"

export abstract class AbstractIterator<T> implements Iterator<T> {

  abstract next(): { done: boolean, value?: T }

  map<R>(proc: (T) => R) {
    const parent = this
    return new class extends AbstractIterator<R> {
      next(): { done: boolean, value?: R } {
        const n = parent.next()
        if (n.done)
          return { done: false }
        return { done: false, value: proc(n.value) }
      }
    }
  }

}

