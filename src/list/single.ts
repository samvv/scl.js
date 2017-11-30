
import { List, Cursor, View } from "../interfaces"

interface Node<T> {
  next: Node<T>
  value: T
}

class NodeCursor<T> implements Cursor<T> {

  constructor(public _list: SingleLinkedList<T>, public _node: Node<T>, public _prev: Node<T> | false = false) {
    
  }

  *[Symbol.iterator](): Iterator<T> {
    let node = this._node;
    do {
      yield node.value;
      node = node.next;
    } while (node !== null);
  }

  get value() {
    return this._node.value;
  }

  set value(newValue: T) {
    this._node.value = newValue;
  }

  _getPrev(): Node<T> {
    if (this._prev === false) {
      this._prev = this._list._findPrev(this._node);
    }
    return this._prev;
  }

  prev() {
    const prev = this._getPrev();
    if (prev === null) {
      return null;
    }
    return new NodeCursor<T>(this._list, prev, false);
  }

  next() {
    if (this._node.next === null) {
      return null;
    }
    return new NodeCursor<T>(this._list, this._node.next, this._node);
  }

}

export class SingleLinkedList<T> implements List<T> {

  constructor(public _first: Node<T> = null, public _last: Node<T> = null, public _size = 0) {

  }

  _findPrev(node: Node<T>) {
    let prev = this._first;
    while (prev.next !== node) prev = prev.next;
    return prev;
  }

  insertBefore(pos: NodeCursor<T>, el: T) {
    const prev = pos._getPrev();
    let newNode;
    if (prev === null) {
      newNode = this.prepend(el)
      pos._prev = this._first
    } else {
      const newNode = { next: pos._node, value: el };
      if (prev.next === null) {
        this._last = newNode;
      }
      prev.next = newNode;
      pos._prev = newNode;
      ++this._size;
    }
    return new NodeCursor<T>(this, newNode);
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

  insertAfter(pos: NodeCursor<T>, el: T) {
    const node = pos._node;
    const newNode = { value: el, next: node.next };
    if (node.next === null) {
      this._last = newNode;
    } else {
      node.next = newNode;
    }
    ++this._size;
    return new NodeCursor<T>(this, newNode, node);
  }

  prepend(el: T) {
    const newNode = { next: this._first, value: el };
    this._first = newNode;
    if (this._last === null) {
      this._last = newNode;
    }
    ++this._size;
    return new NodeCursor<T>(this, newNode, null);
  }

  append(el: T) {
    const newNode = { next: null, value: el }
    let prev = this._last;
    if (this._first === null) {
      this._first = newNode
      this._last = newNode;
    } else {
      this._last.next = newNode;
      this._last = newNode;
    }
    ++this._size;
    return new NodeCursor<T>(this, newNode, prev);
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

  *[Symbol.iterator](): Iterator<T> {
    let node = this._first;
    while (node !== null) {
      yield node.value;
      node = node.next;
    }
  }

  begin() {
    return new NodeCursor<T>(this, this._first, null);
  }

  end() {
    return new NodeCursor<T>(this, this._last, false);
  }

  at(count: number) {
    let curr = this._first, prev = null;
    while (count > 0) {
      prev = curr;
      curr = curr.next;
      --count;
    }
    return new NodeCursor(this, curr, prev);
  }

  deleteAt(pos: NodeCursor<T>) {
    const prev = pos._getPrev()
      , next = pos._node.next;
    if (next === null) {
      this._last = prev;
    }
    if (prev === null) {
      this._first = next;
    } else {
      prev.next = next;
    }
    --this._size;
  }

  deleteAll(el: T) {
    const it = this[Symbol.iterator]();
    let pos;
    while (!(pos = it.next()).done) {
      this.deleteAt(pos);
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

