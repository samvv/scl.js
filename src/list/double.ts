
import { List, Cursor } from "../interfaces"
import { emptyIterator } from "../util"

class Node<T> implements Cursor<T> {

  constructor(public value: T, public _prevNode: Node<T> = null, public _nextNode: Node<T> = null) {

  }

  [Symbol.iterator]() {
    let node: Node<T> = this;
    return {
      next() {
        if (node === null) {
          return <IteratorResult<T>>{ done: true };
        }
        const out = { done: false, value: node.value };
        node = node._nextNode;
        return out;
      }
    }
  }

  next() {
    return this._nextNode;
  }
  
  prev() {
    return this._prevNode;
  }

}

export { Node as Cursor };

export class DoubleLinkedList<T> implements List<T> {
  
  constructor(public _first: Node<T> = null, public _last: Node<T> = null, public _size = 0) {

  }

  insertBefore(pos: Node<T>, el: T) {
    if (pos._prevNode === null) {
      return this.prepend(el)
    } else {
      const newNode = new Node(el, pos._prevNode, pos);
      pos._prevNode._nextNode = newNode;
      pos._prevNode = newNode;
      ++this._size;
      return newNode;
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

  insertAfter(pos: Node<T>, el: T) {
    if (pos._nextNode === null) {
      return this.append(el);
    } else {
      const newNode = new Node<T>(el, pos, pos._nextNode);
      pos._nextNode._prevNode = newNode;
      pos._nextNode = newNode;
      ++this._size;
      return newNode;
    }
  }

  prepend(el: T) {
    const newNode = new Node<T>(el, null, this._first);
    this._first = newNode;
    if (this._last === null) {
      this._last = newNode;
    }
    ++this._size;
    return newNode;
  }

  append(el: T) {
    const newNode = new Node<T>(el, this._last, null);
    if (this._first === null) {
      this._first = newNode
    } else {
      this._last._nextNode = newNode
    }
    this._last = newNode;
    ++this._size;
    return newNode;
  }

  //count(el: T) {
    //let i = 0;
    //let res = 0
    //let node = this._first
    //while (node !== null) {
      //if (node.value === el)
        //++res
      //node = node.next
    //}
    //return res
  //}

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
    if (this._first === null)
      return;
    yield* this._first;
  }

  begin() {
    return this._first;
  }

  end() {
    return this._last;
  }

  at(count: number) {
    let node = this._first;
    while (count > 0) {
      node = node._nextNode;
      --count;
    }
    return node;
  }

  deleteAt(pos: Node<T>) {
    if (pos._prevNode !== null) {
      pos._prevNode._nextNode = pos._nextNode;
    }
    if (pos._nextNode !== null) {
      pos._nextNode._prevNode = pos._prevNode;
    }
    --this._size;
    if (pos === this._first) {
      this._first = pos._nextNode;
    }
    if (pos === this._last) {
      this._last = pos._prevNode;
    }
  }

  //deleteAll(el: T) {
    //const it = this[Symbol.iterator]();
    //let pos;
    //while (!(pos = it.next()).done) {
      //this.deleteAt(pos);
    //}
  //}

  rest() {
    if (this._first === null)
      throw new Error(`list is empty`)
    return new DoubleLinkedList(this._first._nextNode, this._last, this._size-1);
  }

  clear() {
    this._first = null;
    this._last = null;
    this._size = 0;
  }

}

export default DoubleLinkedList

