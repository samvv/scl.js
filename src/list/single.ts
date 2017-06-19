
import { List } from "../../interfaces"

interface Node<T> {
  next: Node<T>
  value: T
}

interface SLIteratorResult<T> extends IteratorResult<T> {
  _prevNode: Node<T> | null
  _node: Node<T>
}

class SLIterator<T> implements Iterator<T> {

  _prevNode: Node<T> | null
  _node: Node<T> | null

  constructor(list: SingleLinkedList<T>) {
    this._node = list._first
    this._prevNode = null
  }

  next(): SLIteratorResult<T> {
    if (this._node === null)
      return { _node: this._node, _prevNode: this._prevNode, done: true, value: undefined }
    const res = { _node: this._node, _prevNode: this._prevNode, done: false, value: this._node.value }
    this._node = this._node.next
    this._prevNode = this._node
    return res
  }

}

export class SingleLinkedList<T> implements List<T> {

  constructor(public _first: Node<T> | null = null) {

  }

  insertBefore(pos: Iterator<T>, el: T) {
    if ((<SLIterator<T>>pos)._prevNode === null) {
      this.prepend(el)
    } else {
      const newNode = { next: (<SLIterator<T>>pos)._node, value: el };
      (<SLIterator<T>>pos)._prevNode.next = newNode;
      (<SLIterator<T>>pos)._prevNode = newNode;
    }
  }

  insertAfter(pos: Iterator<T>, el: T) {
    (<SLIterator<T>>pos)._node.next = { value: el, next: null }
  }

  prepend(el: T) {
    this._first = { next: this._first, value: el }
  }

  append(el: T) {
    const newNode = { next: null, value: el }
    if (this._first === null) {
      this._first = newNode
    } else {
      let node = this._first
      while (node.next !== null) node = node.next;
      node.next = newNode
    }
  }

  count() {
    let res = 0
    let node = this._first
    while (node !== null) {
      ++res
      node = node.next
    }
    return res
  }

  has(el: T) {
    let node = this._first
    while (node !== null)
      if (node.value === el)
        return true
    return false
  }

  iterator(): SLIterator<T> {
    return new SLIterator(this)
  }

  [Symbol.iterator](): SLIterator<T> {
    return this.iterator()
  }

  begin() {
    return this.iterator()
  }

  end() {
    const it = this.begin()
    while (!it.next().done);
    return it;
  }

  at(count: number) {
    const it = this.begin()
    while (true) { 
      --count
      const pos = it.next()
      if (pos.done && count > 0)
        throw new Error(`out of bounds`)
      if (count === 0)
        return pos
    }
  }

  deleteAll(el: T) {
    let prev = null, node = this._first
    while (node !== null) {
      if (node.value === el) {
        if (prev === null)
          this._first = node.next
        else
          prev._next = node.next
      }
      prev = node
      node = node.next
    }
  }

  rest() {
    if (this._first === null)
      throw new Error(`list is empty`)
    return new SingleLinkedList(this._first.next)
  }

  clear() {
    this._first = null
  }

}

export default SingleLinkedList

