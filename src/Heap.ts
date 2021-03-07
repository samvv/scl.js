
import { Collection, Cursor } from "./interfaces";
import Vector, { VectorCursor, VectorOptions } from "./Vector";

export interface HeapOptions<T> extends VectorOptions<T> {
  compare?: (a: T, b: T) => boolean;
}

/**
 * @ignore
 */
export class BinaryMinHeap<T> {

  get size() {
    return this._vector.size;
  }

  /**
   * @ignore
   */
  constructor(
      /** @ignore */ public _vector: Vector<T>
    , /** @ignore */ public compare: (a: T, b: T) => boolean,
  ) {

  }

  public min() {
    if (this._vector.size === 0) {
      throw new Error(`Cannot get smallest element: heap is empty.`);
    }
    return this._vector.first();
  }

  public add(el: T): [boolean, Cursor<T>] {
    this._vector.append(el);
    const position = this._siftUp(this._vector.size);
    return [true, new VectorCursor<T>(this._vector, position - 1)];
  }

  public delete(el: T) {
    for (let i = 0; i < this._vector.size; ++i) {
      if (this._vector.getAt(i) === el) {
        this.deleteAtIndex(i);
        return true;
      }
    }
    return false;
  }

  public deleteAll(el: T): number {
    let count = 0;
    for (let i = 0; i < this._vector.size; ++i) {
      if (this._vector.getAt(i) === el) {
        this.deleteAtIndex(i);
        count++;
      }
    }
    return count;
  }

  public deleteMin() {
    this.deleteAtIndex(0);
  }

  public deleteAtIndex(index: number) {
    if (index === this._vector.size - 1) {
      this._vector.deleteAtIndex(index);
      return;
    }
    const replacement = this._vector.getAt(this._vector.size - 1);
    this._vector.replace(index, replacement);
    this._vector.deleteAtIndex(this._vector.size - 1);
    if (this._vector.size <= 1) {
      return;
    }
    if (index > 1 && !this.compare(replacement, this._vector.getAt(Math.floor((index + 1) / 2) - 1))) {
      this._siftUp(index + 1);
    } else {
      this._siftDown(index + 1);
    }
  }

  public deleteAt(cursor: VectorCursor<T>) {
    this.deleteAtIndex(cursor._index);
  }

  public clone() {
    return new BinaryMinHeap<T>(this._vector.clone(), this.compare);
  }

  private _siftDown(position: number) {
    while (true) {
      const left = 2 * position, right = 2 * position + 1;
      let smallest = position;
      if (left <= this._vector.size && this.compare(this._vector.getAt(left - 1), this._vector.getAt(smallest - 1))) {
        smallest = left;
      }
      if (right <= this._vector.size && this.compare(this._vector.getAt(right - 1), this._vector.getAt(smallest - 1))) {
        smallest = right;
      }
      if (smallest !== position) {
        this._vector.swap(position - 1, smallest - 1);
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
      if (!this.compare(this._vector.getAt(parentPos - 1), this._vector.getAt(position - 1))) {
        // swap() inlined to save one getAt() call
        const keep = this._vector.getAt(parentPos - 1);
        this._vector.replace(parentPos - 1, element);
        this._vector.replace(this._vector.size - 1, keep);
        element = keep;
        position = parentPos;
      } else {
        break;
      }
    }
    return position;
  }

}

export default BinaryMinHeap;
