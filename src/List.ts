
import { Container } from "../interfaces/Container"

interface SLCell<T> {
  value: T
  next: SLCell<T>
}

export class SingleLinkedList<T> implements Container<T> {

  first: SLCell<T> | null
  last: SLCell<T> | null

  add(el: T) {
    this.append(el)
  }

  remove(el: T) {
    this.removeFirst(el)   
  }

  isEmpty() {
    return !!this.first
  }

  append(el: T) {
    const cell = { value: el, next: this.last }
    if (this.first === null) // => this.last === null
      this.first = this.last = cell
    else {
      this.last.next = cell
      this.last = cell
    }
  }

  prepend(el: T) {
    const cell = { value: el, next: this.first }
    if (this.last === null)
      this.last = cell
    this.first = cell
  }

  removeLast(el: T) {

  }

  removeFirst(el: T) {

  }

}

