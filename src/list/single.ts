
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

  constructor(public _first: Node<T> = null, public _last: Node<T> = null, public _size = 0) {

  }

  insertBefore(pos: IteratorResult<T>, el: T) {
    const slpos = (<SLIteratorResult<T>>pos);
    if (slpos._prevNode === null) {
      this.prepend(el)
      slpos._prevNode = this._first
    } else {
      const newNode = { next: slpos._node, value: el };
      if (slpos._prevNode.next === null) {
        this._last = newNode;
      }
      slpos._prevNode.next = newNode;
      slpos._prevNode = newNode;
      ++this._size;
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
    return this._last.value;
  }

  insertAfter(pos: IteratorResult<T>, el: T) {
    const node = (<SLIteratorResult<T>>pos)._node;
    const newNode = { value: el, next: node.next };
    if (node.next === null) {
      this._last = newNode;
    } else {
      node.next = newNode;
    }
    ++this._size;
  }

  prepend(el: T) {
    const newNode = { next: this._first, value: el };
    this._first = newNode;
    if (this._last === null) {
      this._last = newNode;
    }
    ++this._size;
  }

  append(el: T) {
    const newNode = { next: null, value: el }
    if (this._first === null) {
      this._first = newNode
      this._last = newNode;
    } else {
      this._last.next = newNode;
      this._last = newNode;
    }
    ++this._size;
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
    return this._size;
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

  deleteAt(pos: SLIteratorResult<T>) {
    pos._prevNode.next = pos._node.next;
    --this._size;
  }

  deleteAll(el: T) {
    const it = this[Symbol.iterator]();
    let pos;
    while (!(pos = it.next()).done) {
      this.delete(pos);
    }
  }

  rest() {
    if (this._first === null)
      throw new Error(`list is empty`)
    return new SingleLinkedList(this._first.next, this._last, this._size-1)
  }

  clear() {
    this._first = null;
    this._last = null;
    this._size = 0;
  }

}

export default SingleLinkedList

