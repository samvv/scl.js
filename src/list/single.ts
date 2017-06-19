
import { List } from "../../interfaces"
import { getPosAt } from "../iterator"

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
    this._prevNode = this._node
    this._node = this._node.next
    return res
  }

}

export class SingleLinkedList<T> implements List<T> {

  constructor(public _first: Node<T> | null = null) {

  }

  insertBefore(pos: IteratorResult<T>, el: T) {
    const slpos = (<SLIteratorResult<T>>pos);
    if (slpos._prevNode === null) {
      this.prepend(el)
      slpos._prevNode = this._first
    } else {
      const newNode = { next: slpos._node, value: el };
      slpos._prevNode.next = newNode;
      slpos._prevNode = newNode;
    }
  }

  first() {
    if (this._first === null)
      throw new Error(`container is empty`)
    return this._first.value
  }

  last() {
    if (this._first === null)
      throw new Error(`container is empty`)
    // HACK
    return this.end().next()._prevNode.value
  }

  insertAfter(pos: IteratorResult<T>, el: T) {
    const node = (<SLIteratorResult<T>>pos)._node;
    node.next = { value: el, next: node.next }
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

  count(el: T) {
    let res = 0
    let node = this._first
    while (node !== null) {
      if (node.value === el)
        ++res
      node = node.next
    }
    return res
  }

  size() {
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
    return getPosAt(this.begin(), count)
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

