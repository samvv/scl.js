
import { List } from "../interfaces/List"

interface Cell<T> {
  value: T
  next: Cell<T>
  prev: Cell<T>
}

export class DoubleLinkedList<T> implements List<T> {

  firstCell: Cell<T> | null = null
  lastCell: Cell<T> | null = null

  has(el: T) {
    return !!this.findCell(el)
  }

  iterator() {
    let curr = this.firstCell
    const list = this
    return new class {
      next(): { done: boolean, value?: T } {
        if (curr === list.lastCell)
          return { done: true }
        const res = { done: false, value: curr.value }
        curr = curr.next
        return res
      }
      prev() {
        if (curr === list.firstCell)
          return { done: true }
        const res = { done: false, value: curr.value } 
        curr = curr.prev
        return res
      }
    }
  }

  prepend(el: T) {
    const cell = {
      value: el
    , next: null
    , prev: this.lastCell
    }
    this.lastCell.next = cell
    this.lastCell = cell
  }

  append(el: T) {
    const cell = {
      value: el
    , next: this.firstCell
    , prev: null
    }
    this.firstCell.prev = cell
    this.firstCell = cell
  }

  insertBefore(iterator: Iterator<T>) {

  }

  [Symbol.iterator]() {
    return this.iterator()
  }

  first() {
    if (this.firstCell === null)
      throw new Error(`list is empty`)
    return this.firstCell.value
  }

  last() {
    if (this.lastCell === null)
      throw new Error(`list is empty`)
    return this.lastCell.value
  }

  removeFirst(el: T) {
    const cell = this.findCell(el)
    if (!cell)
      throw new Error(`element ${el} not found`)
    this.removeCell(cell)
  }

  removeLast(el: T) {
    const cell = this.findLastCell(el)
    if (!cell)
      throw new Error(`element ${el} not found`)
    this.removeCell(cell)
  }

  private findCell(el: T) {
    let cell = this.firstCell
    while (cell !== null) {
      if (cell.value === el)
        return cell
      cell = cell.next
    }
    return null
  }

  private findLastCell(el: T) {
    let cell = this.lastCell
    while (cell !== null) {
      if (cell.value === el)
        return cell
      cell = cell.prev
    }
    return null
  }
 
  private removeCell(cell: Cell<T>) {
    cell.prev.next = cell.next
    cell.next.prev = cell.prev
    if (this.firstCell === cell)
      this.firstCell = cell.next
    if (this.lastCell === cell)
      this.lastCell = cell.prev
  }
}

