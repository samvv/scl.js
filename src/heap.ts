
import { Collection, Cursor } from "./interfaces"
import { lesser } from "./util"
import Vector, { VectorCursor, VectorOptions } from "./vector"

/**
 * @ignore
 */
abstract class HeapBase<T> {

  constructor(public _vector: Vector<T>, public compare: (a: T, b: T) => boolean) {

  }

  get size() {
    return this._vector.size;
  }
  
  has(el: T) {
    return this._vector.has(el);
  }

  [Symbol.iterator]() {
    return this._vector[Symbol.iterator]();
  }

  isEmpty() {
    return this._vector.size === 0;
  }

  clear() {
    this._vector.clear();
  }

  toRange() {
    return this._vector.toRange();
  }

}

export interface HeapOptions<T> extends VectorOptions<T> { 
  compare?: (a: T, b: T) => boolean;
}

/**
 * @ignore
 */
export class BinaryMinHeap<T> extends HeapBase<T> implements Collection<T> {

  static from<T>(elements: Iterable<T>, opts: HeapOptions<T> = {}) {
    const lessThan = opts.compare !== undefined ? opts.compare : lesser;
    return new BinaryMinHeap(Vector.from<T>(elements, opts), lessThan);
  }

  static empty<T>(opts: HeapOptions<T> = {}) {
    const lessThan = opts.compare !== undefined ? opts.compare : lesser;
    return new BinaryMinHeap(Vector.empty(opts), lessThan);
  }

  clone(): BinaryMinHeap<T> {
    return new BinaryMinHeap<T>(this._vector.clone(), this.compare)
  }

  min() {
    if (this._vector.size === 0) {
      throw new Error(`Cannot get smallest element: heap is empty.`);
    }
    return this._vector.first();
  }

  add(el: T): [boolean, Cursor<T>] {
    this._vector.append(el);
    const position = this._siftUp(this._vector.size)
    return [true, new VectorCursor<T>(this._vector, position-1)];
  }

  delete(el: T) {
    for (let i = 0; i < this._vector.size; ++i) {
      if (this._vector.getAt(i) === el) {
        this._deleteAtIndex(i+1);
        return true;
      }
    }
    return false;
  }

  deleteAll(el: T): number {
    let count = 0;
    for (let i = 0; i < this._vector.size; ++i) {
      if (this._vector.getAt(i) === el) {
        this._deleteAtIndex(i+1);
        count++;
      }
    }
    return count;
  }

  deleteMin() {
    this._deleteAtIndex(1)
  }

  private _swap(a: number, b: number) {
    const keep = this._vector.getAt(a)
    this._vector.replace(a, this._vector.getAt(b))
    this._vector.replace(b, keep)
  }

  _deleteAtIndex(position: number) {
    this._vector.replace(position-1, this._vector.getAt(this._vector.size-1))
    this._vector.deleteAtIndex(this._vector._size-1);
    if (position !== 1 && this.compare(this._vector.getAt(position-1), this._vector.getAt(Math.floor(position / 2) - 1))) {
      this._siftUp(position);
    } else {
      this._siftDown(position);
    }
  }

  deleteAt(position: VectorCursor<T>) {
    this._vector.deleteAt(position);
  }

  private _siftDown(position: number) {
    while (true) {
      const left = 2 * position, right = 2 * position + 1
      let smallest = position
      if (left <= this._vector.size && this.compare(this._vector.getAt(left - 1), this._vector.getAt(smallest - 1))) {
        smallest = left
      }
      if (right <= this._vector.size && this.compare(this._vector.getAt(right - 1), this._vector.getAt(smallest - 1))) {
        smallest = right
      }
      if (smallest !== position) {
        this._swap(position - 1, smallest - 1);
        position = smallest;
      } else {
        break;
      }
    }
  }

  private _siftUp(position: number) {
    let element = this._vector.getAt(position - 1);
    while (position > 1) {
      const parentPos = Math.floor(position / 2);
      if (!this.compare(this._vector.getAt(parentPos-1), this._vector.getAt(position-1))) {
        const keep = this._vector.getAt(parentPos-1);
        this._vector.replace(parentPos-1, element);
        this._vector.replace(this._vector.size-1, keep);
        element = keep;
        position = parentPos;
      } else {
        break;
      }
    }
    return position;
  }

}

export default BinaryMinHeap 

