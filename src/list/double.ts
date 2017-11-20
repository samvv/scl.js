
import { List } from "../../interfaces"
import { getPosAt } from "../iterator"

interface Node<T> {
  prev: Node<T>
  next: Node<T>
  value: T
}

interface DLIteratorResult<T> extends IteratorResult<T> {
  _node: Node<T>
}

class DLIterator<T> implements Iterator<T> {

  _node: Node<T> | null

  constructor(list: DoubleLinkedList<T>) {
    this._node = list._first
  }

  next(): DLIteratorResult<T> {
    if (this._node === null)
      return { _node: this._node, done: true, value: undefined }
    const res = { _node: this._node, done: false, value: this._node.value }
    this._node = this._node.next
    return res
  }

}

export class DoubleLinkedList<T> implements List<T> {
  
  constructor(public _first: Node<T> = null, public _last: Node<T> = null, public _size = 0) {

  }

  insertBefore(pos: IteratorResult<T>, el: T) {
    const dlpos = (<DLIteratorResult<T>>pos);
    if (dlpos._node.prev === null) {
      this.prepend(el)
    } else {
      const newNode = { prev: dlpos._node.prev, next: dlpos._node, value: el };
      dlpos._node.prev.next = newNode;
      dlpos._node.prev = newNode;
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
    const node = (<DLIteratorResult<T>>pos)._node;
    const newNode = { value: el, prev: node.prev, next: node.next };
    if (node.next === null) {
      this._last = newNode;
    } else {
      node.next.prev = newNode;
    }
    node.next = newNode;
    ++this._size;
  }

  prepend(el: T) {
    const newNode = { prev: null, next: this._first, value: el };
    this._first = newNode;
    if (this._last === null) {
      this._last = newNode;
    }
    ++this._size;
  }

  append(el: T) {
    const newNode = { prev: this._last, next: null, value: el }
    this._last = newNode;
    if (this._first === null) {
      this._first = newNode
    } else {
      let node = this._first
      while (node.next !== null) node = node.next;
      node.next = newNode
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

  // TODO
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

  iterator(): DLIterator<T> {
    return new DLIterator(this)
  }

  [Symbol.iterator](): DLIterator<T> {
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

  deleteAt(pos: DLIteratorResult<T>) {
    pos._node.prev.next = pos._node.next;
    pos._node.next.prev = pos._node.prev;
    --this._size;
    if (pos._node === this._first) {
      this._first = pos._node.next;
    }
    if (pos._node === this._last) {
      this._last = pos._node.prev;
    }
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
    return new DoubleLinkedList(this._first.next, this._last, this._size-1);
  }

  clear() {
    this._first = null;
    this._last = null;
    this._size = 0;
  }

}

export default DoubleLinkedList

