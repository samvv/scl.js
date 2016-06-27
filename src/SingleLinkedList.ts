
/// <reference path="../typings/index.d.ts" />

import { List } from "../interfaces/List"

interface Cell<T> {
  value: T
  next: Cell<T>
}

export class SingleLinkedList<T> implements List<T> {

  private firstCell: Cell<T> | null = null
  private lastCell: Cell<T> | null = null

  add(el: T) {
    this.append(el)
  }

  remove(el: T) {
    this.removeFirst(el)   
  }

  [Symbol.iterator]() {
    return this.iterator()
  }

  iterator() {
    let currentCell = this.firstCell
    const list = this
    return new class {
      next(): { done: boolean, value?: T } {
        if (currentCell === list.lastCell)
          return { done: true }
        currentCell = currentCell.next
        return { done: false, value: currentCell.value }
      }
    }
  }

  isEmpty() {
    return !!this.firstCell
  }

  has(el: T) {
    let cell = this.firstCell
    do {
      if (cell.value === el)
        return true
    } while ((cell = cell.next) !== null)
    return false
  }

  append(el: T) {
    const cell = { next: this.lastCell, value: el }
    if (this.firstCell === null) // => this.lastCell === null
      this.firstCell = this.lastCell = cell
    else {
      this.lastCell.next = cell
      this.lastCell = cell
    }
  }

  prepend(el: T) {
    const cell = { next: this.firstCell, value: el }
    if (this.lastCell === null)
      this.lastCell = cell
    this.firstCell = cell
  }

  removeLast(el: T) {
    if (this.firstCell === null)
      throw new Error(`element ${el} not found`)
    let lastMatchedPrevCell, lastMatchedCell
      , prevCell = null
      , cell = this.firstCell
    do {
      if (cell.value === el) {
        lastMatchedPrevCell = prevCell
        lastMatchedCell = cell
      }
      prevCell = cell
    } while ((cell = cell.next) !== null)
    if (!lastMatchedPrevCell)
      throw new Error(`element ${el} not found`)
    if (prevCell !== null)
      lastMatchedPrevCell.next = lastMatchedCell.next
    if (lastMatchedCell === this.lastCell)
      this.lastCell = lastMatchedPrevCell
    if (lastMatchedCell === this.firstCell)
      this.firstCell = lastMatchedPrevCell
  }

  removeFirst(el: T) {
    if (this.firstCell === null)
      throw new Error(`element ${el} not found`)
    let prevCell = null
      , cell = this.firstCell
    do {
      if (cell.value === el) {
        if (prevCell !== null)
          prevCell.next = cell.next
        if (this.lastCell === cell)
          this.lastCell = prevCell
        if (this.firstCell === cell)
          this.firstCell = prevCell
        return
      }
      prevCell = cell
    } while ((cell = cell.next))
  }

}

