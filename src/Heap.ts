
import type { Cursor } from "./interfaces.js";
import Vector, { VectorCursor, VectorOptions } from "./Vector.js";

export interface HeapOptions<T> extends VectorOptions<T> {
  compare?: (a: T, b: T) => boolean;
}

export class BinaryMinHeap<T> {

  public get size(): number {
    return this.vector.size;
  }

  constructor(
    /**
     * @ignore
     */
    public vector: Vector<T>,
    /**
     * @ignore
     */
    public compare: (a: T, b: T) => boolean,
  ) {

  }

  public min(): T {
    if (this.vector.size === 0) {
      throw new Error(`Cannot get smallest element: heap is empty.`);
    }
    return this.vector.first();
  }

  public add(el: T): [boolean, Cursor<T>] {
    this.vector.append(el);
    const position = this.siftUp(this.vector.size);
    return [true, new VectorCursor<T>(this.vector, position - 1)];
  }

  public delete(el: T): boolean {
    for (let i = 0; i < this.vector.size; ++i) {
      if (this.vector.getAt(i) === el) {
        this.deleteAtIndex(i);
        return true;
      }
    }
    return false;
  }

  public deleteAll(el: T): number {
    let count = 0;
    for (let i = 0; i < this.vector.size; ++i) {
      if (this.vector.getAt(i) === el) {
        this.deleteAtIndex(i);
        count++;
      }
    }
    return count;
  }

  public deleteMin(): void {
    this.deleteAtIndex(0);
  }

  public deleteAtIndex(index: number): void {
    if (index === this.vector.size - 1) {
      this.vector.deleteAtIndex(index);
      return;
    }
    const replacement = this.vector.getAt(this.vector.size - 1);
    this.vector.replace(index, replacement);
    this.vector.deleteAtIndex(this.vector.size - 1);
    if (this.vector.size <= 1) {
      return;
    }
    if (index > 1 && !this.compare(replacement, this.vector.getAt(Math.floor((index + 1) / 2) - 1))) {
      this.siftUp(index + 1);
    } else {
      this.siftDown(index + 1);
    }
  }

  public deleteAt(cursor: VectorCursor<T>): void {
    this.deleteAtIndex(cursor._index);
  }

  public clone(): BinaryMinHeap<T> {
    return new BinaryMinHeap<T>(this.vector.clone(), this.compare);
  }

  private siftDown(position: number) {
    while (true) {
      const left = 2 * position, right = 2 * position + 1;
      let smallest = position;
      if (left <= this.vector.size && this.compare(this.vector.getAt(left - 1), this.vector.getAt(smallest - 1))) {
        smallest = left;
      }
      if (right <= this.vector.size && this.compare(this.vector.getAt(right - 1), this.vector.getAt(smallest - 1))) {
        smallest = right;
      }
      if (smallest !== position) {
        this.vector.swap(position - 1, smallest - 1);
        position = smallest;
      } else {
        break;
      }
    }
  }

  private siftUp(position: number) {
    let element = this.vector.getAt(position - 1);
    while (position > 1) {
      const parentPos = Math.floor(position / 2);
      if (!this.compare(this.vector.getAt(parentPos - 1), this.vector.getAt(position - 1))) {
        // swap() inlined to save one getAt() call
        const keep = this.vector.getAt(parentPos - 1);
        this.vector.replace(parentPos - 1, element);
        this.vector.replace(this.vector.size - 1, keep);
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
