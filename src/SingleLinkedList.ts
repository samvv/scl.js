
import type { List } from "./interfaces.js";
import { CursorBase, RangeBase } from "./util.js";

interface Node<T> {
  next: Node<T> | null;
  value: T;
}

/**
 * @ignore
 */
export class SingleLinkedListCursor<T> extends CursorBase<T> {

  constructor(protected _list: SingleLinkedList<T>, public _node: Node<T>) {
    super();
  }

  get value() {
    return this._node.value;
  }

  set value(newValue: T) {
    this._node.value = newValue;
  }

  public prev() {
    const prev = this._list._findPrev(this._node);
    if (prev === null) {
      return null;
    }
    return new SingleLinkedListCursor<T>(this._list, prev);
  }

  public next() {
    if (this._node.next === null) {
      return null;
    }
    return new SingleLinkedListCursor<T>(this._list, this._node.next);
  }

}

/**
 * @ignore
 */
export class SingleLinkedListRange<T> extends RangeBase<T> {

 constructor(protected _list: SingleLinkedList<T>, protected _startNode: Node<T> | null, protected _endNode: Node<T> | null, public readonly reversed: boolean) {
    super();
  }

  get size() {
    if (this._startNode === this._list._firstNode && this._endNode === this._list._lastNode) {
      return this._list.size;
    }
    let count = 0;
    let node = this._startNode;
    while (node !== null) {
      count++;
      if (node === this._endNode) {
        break;
      }
      node = node.next;
    }
    return count;
  }

  public reverse() {
    return new SingleLinkedListRange<T>(this._list, this._startNode, this._endNode, !this.reversed);
  }

  public *[Symbol.iterator]() {
    if (!this.reversed) {
      let node = this._startNode;
      while (node !== null) {
        yield node.value;
        if (node === this._endNode) {
          break;
        }
        node = node.next;
      }
    } else {
      let node = this._endNode;
      while (node !== null) {
        yield node.value;
        if (node === this._startNode) {
          break;
        }
        node = this._list._findPrev(node);
      }
    }
  }

  public *cursors() {
    if (!this.reversed) {
      let node = this._startNode;
      while (node !== null) {
        yield new SingleLinkedListCursor<T>(this._list, node);
        if (node === this._endNode) {
          break;
        }
        node = node.next;
      }
    } else {
      let node = this._endNode;
      while (node !== null) {
        yield new SingleLinkedListCursor<T>(this._list, node);
        if (node === this._startNode) {
          break;
        }
        node = this._list._findPrev(node);
      }
    }
  }

}

/**
 * A singly-linked list, which is sometimes slower than a doubly-linked list
 * but consumes less memory.
 *
 * ```ts
 * import { SingleLinkedList } from "scl"
 * ```
 *
 * The following table summarises the time complexity of the most commonly used
 * properties.
 *
 * | Property name                                        | Worst-case |
 * |------------------------------------------------------|------------|
 * | {@link SingleLinkedList.append append()}             | O(n)       |
 * | {@link SingleLinkedList.insertAfter insertAfter()}   | O(1)       |
 * | {@link SingleLinkedList.insertBefore insertBefore()} | O(n)       |
 * | {@link SingleLinkedList.deleteAt deleteAt()}         | O(n)       |
 * | {@link SingleLinkedList.prepend prepend()}           | O(1)       |
 * | {@link SingleLinkedList.size size}                   | O(1)       |
 *
 * Some remarks:
 *
 *  - Deleting at the beginning of a singly-linked list is guaranteed to be in `O(1)`.
 *
 * @see [[DoubleLinkedList]]
 * @see [[Vector]]
 *
 * @typeparam T The type of element in this collection.
 */
export class SingleLinkedList<T> implements List<T> {

  /**
   * @ignore
   */
  public _firstNode: Node<T> | null = null;

  /**
   * @ignore
   */
  public _lastNode: Node<T> | null = null;

  /**
   * @ignore
   */
  public _size = 0;

  /**
   * Construct a singly-linked list.
   *
   * ```ts
   * const l = new SingleLinkedList();
   * ```
   *
   * You can also constrcut a linked list from any iterable, like so:
   *
   * ```ts
   * const l = new SingleinkedList([1, 2, 3])
   * ```
   */
  constructor(iterable?: Iterable<T>) {
    if (iterable !== undefined) {
      for (const element of iterable) {
        this.append(element);
      }
    }
  }

  /**
   * @ignore
   */
  public _findPrev(node: Node<T>) {
    let prev = this._firstNode;
    while (prev !== null && prev.next !== node) {
      prev = prev.next;
    }
    return prev;
  }

  public add(element: T): [boolean, SingleLinkedListCursor<T>] {
    return [true, this.prepend(element)];
  }

  public getAt(index: number) {
    return this.at(index).value;
  }

  public first() {
    if (this._firstNode === null) {
      throw new Error(`Cannot get first element: collection is empty.`);
    }
    return this._firstNode.value;
  }

  public last() {
    if (this._lastNode === null) {
      throw new Error(`Cannot get last element: collection is empty.`);
    }
    return this._lastNode.value;
  }

  public insertBefore(pos: SingleLinkedListCursor<T>, el: T) {
    const newNode = { next: pos._node, value: el };
    if (pos._node === this._firstNode) {
      this._firstNode = newNode;
    } else {
      const prev = this._findPrev(pos._node)!;
      prev.next = newNode;
    }
    ++this._size;
    return new SingleLinkedListCursor<T>(this, newNode);
  }

  public insertAfter(pos: SingleLinkedListCursor<T>, el: T) {
    const newNode = { value: el, next: pos._node.next };
    if (pos._node.next === null) {
      this._lastNode = newNode;
    }
    pos._node.next = newNode;
    ++this._size;
    return new SingleLinkedListCursor<T>(this, newNode);
  }

  public prepend(el: T) {
    const newNode = { next: this._firstNode, value: el };
    this._firstNode = newNode;
    if (this._lastNode === null) {
      this._lastNode = newNode;
    }
    ++this._size;
    return new SingleLinkedListCursor<T>(this, newNode);
  }

  public append(el: T) {
    const newNode = { next: null, value: el };
    if (this._lastNode === null) {
      this._firstNode = newNode;
      this._lastNode = newNode;
    } else {
      this._lastNode.next = newNode;
      this._lastNode = newNode;
    }
    ++this._size;
    return new SingleLinkedListCursor<T>(this, newNode);
  }

  get size() {
    return this._size;
  }

  public has(el: T) {
    let node = this._firstNode;
    while (node !== null) {
      if (node.value === el) {
        return true;
      }
      node = node.next;
    }

    return false;
  }

  public *[Symbol.iterator](): IterableIterator<T> {
    let node = this._firstNode;
    while (node !== null) {
      yield node.value;
      node = node.next;
    }
  }

  public at(position: number) {
    let curr = this._firstNode;
    let i = position;
    while (i > 0) {
      if (curr === null) {
        throw new RangeError(`Could not get element at i ${position}: index out of bounds.`);
      }
      curr = curr.next;
      --i;
    }
    if (curr === null) {
      throw new RangeError(`Could not get element at position ${position}: index out of bounds.`);
    }
    return new SingleLinkedListCursor<T>(this, curr);
  }

  public deleteAt(pos: SingleLinkedListCursor<T>) {
    const prev = this._findPrev(pos._node)
        , next = pos._node.next;
    if (prev === null) {
      this._firstNode = next;
    } else {
      prev.next = next;
    }
    if (next === null) {
      this._lastNode = prev;
    }
    --this._size;
  }

  public delete(element: T): boolean {
    let node: Node<T> | null = this._firstNode;
    let prev = null;
    while (node !== null) {
      if (node.value === element) {
        const next = node.next;
        if (prev === null) {
          this._firstNode = next;
        } else {
          prev.next = node.next;
        }
        if (next === null) {
          this._lastNode = prev;
        }
        this._size--;
        return true;
      }
      prev = node;
      node = node.next;
    }
    return false;
  }

  public deleteAll(el: T): number {
    let count = 0;
    let node: Node<T> | null = this._firstNode;
    let prev = null;
    while (node !== null) {
      if (node.value === el) {
        node = node.next;
        this._size--;
        while (node !== null && node.value === el) {
          this._size--;
          node = node.next;
        }
        if (prev === null) {
          this._firstNode = node;
        } else {
          prev.next = node;
        }
        if (node === null) {
          this._lastNode = prev;
        }
        count++;
      } else {
        prev = node;
        node = node.next;
      }
    }
    return count;
  }

  public toRange() {
    return new SingleLinkedListRange<T>(this, this._firstNode, this._lastNode, false);
  }

  public rest(): List<T> {
    if (this._firstNode === null) {
      throw new Error(`Could not get rest of list: list is empty.`);
    }
    const list = new SingleLinkedList<T>();
    list._firstNode = this._firstNode.next;
    list._lastNode = this._lastNode;
    list._size = this._size - 1;
    return list;
  }

  public clone() {
    return new SingleLinkedList<T>(this);
  }

  public clear() {
    this._firstNode = null;
    this._lastNode = null;
    this._size = 0;
  }

}

export default SingleLinkedList;
