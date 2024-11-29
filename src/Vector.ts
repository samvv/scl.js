
import type { Sequence } from "./interfaces.js";
import { DEFAULT_VECTOR_ALLOC_STEP, DEFAULT_VECTOR_CAPACITY } from "./constants.js";
import { CursorBase, isIterable, RangeBase } from "./util.js";

export class VectorCursor<T> extends CursorBase<T> {

  constructor(public vector: Vector<T>, public _index: number) {
    super();
  }

  public get value() {
    return this.vector._elements[this._index];
  }

  public set value(newValue: T) {
    this.vector._elements[this._index] = newValue;
  }
  public *[Symbol.iterator]() {
    const elements = this.vector._elements;
    const size = this.vector._elementCount;
    for (let i = this._index; i < size; ++i) {
      yield elements[i];
    }
  }

  public next() {
    if (this._index === this.vector._elementCount - 1) {
      return;
    }
    return new VectorCursor<T>(this.vector, this._index + 1);
  }

  public prev() {
    if (this._index === 0) {
      return;
    }
    return new VectorCursor<T>(this.vector, this._index - 1);
  }

}

/**
 * @ignore
 */
export class VectorRange<T> extends RangeBase<T> {

  constructor(public _vector: Vector<T>, public _min: number, public _max: number, public readonly reversed: boolean) {
    super();
  }

  get size() {
    return this._max - this._min;
  }

  public slice(a: number, b: number) {
    return new VectorRange<T>(this._vector, this._min + a, this._min + b, this.reversed);
  }

  public *[Symbol.iterator]() {
    if (!this.reversed) {
      for (let i = this._min; i < this._max; ++i) {
        yield this._vector._elements[i];
      }
    } else {
      for (let i = this._max; i >= this._min; i--) {
        yield this._vector._elements[i];
      }
    }
  }

  public *cursors() {
    if (this.reversed) {
      for (let i = this._max; i >= this._min; i--) {
        yield new VectorCursor<T>(this._vector, i);
      }
    } else {
      for (let i = this._min; i < this._max; ++i) {
        yield new VectorCursor<T>(this._vector, i);
      }
    }
  }

  public reverse() {
    return new VectorRange<T>(this._vector, this._min, this._max, !this.reversed);
  }

}

function copy<T>(
  src: T[],
  dst: T[],
  dstStart = 0,
  srcStart = 0,
  srcEnd: number = src.length,
) {
  for (let i = 0; i < srcEnd - srcStart; i++) {
    dst[dstStart + i] = src[srcStart + i];
  }
}

function createArray<T>(iterable: Iterable<T>, capacity: number) {
  const elements = [...iterable];
  const size = elements.length;
  elements.length = Math.max(size, capacity);
  return [elements, size] as [T[], number];
}

/**
 * Options to be passed to the constructor of {@link Vector}.
 *
 * You don't have to specify these values, as the vector implementation will
 * attempt to load sane defaults.
 *
 * @see {@link Vector.constructor}
 */
export interface VectorOptions<T> {

  /**
   * An iterable that will be consumed to fill the vector.
   */
  elements?: Iterable<T>;

  /**
   * This value specifies how much capacity the vector should _at least_ have.
   */
  capacity?: number;

  /**
   * When the vector overflows, this option determines how big the vector will
   * become.
   */
  allocStep?: number;

}

/**
 * A vector is a sequence with fast member access by sequence number.
 *
 * ```
 * import { Vector } from "scl"
 * ```
 *
 * Inserting elements anywhere else than at the end is very slow and should be
 * avoided. When inserting, the vector may need to re-allocate to provide
 * enough room for the new element.
 *
 * The following table summarises the time complexity of the most commonly used
 * properties.
 *
 * | Property name                              | Worst-case |
 * |--------------------------------------------|------------|
 * | {@link Vector.append append()}             | O(n)       |
 * | {@link Vector.at at()}                     | O(1)       |
 * | {@link Vector.at getAt()}                  | O(1)       |
 * | {@link Vector.insertAfter insertAfter()}   | O(n)       |
 * | {@link Vector.insertBefore insertBefore()} | O(n)       |
 * | {@link Vector.deleteAt deleteAt()}         | O(n)       |
 * | {@link Vector.prepend prepend()}           | O(n)       |
 * | {@link Vector.size size}                   | O(1)       |
 *
 * ```ts
 * const v = new Vector<number>()
 * v.append(1)
 * v.append(2)
 * v.append(3)
 * assert.strictEqual(v.size, 3)
 * ```
 *
 * @see {@link DoubleLinkedList}
 * @see {@link SingleLinkedList}
 *
 * @typeParam T The type of element in the collection.
 */
export class Vector<T> implements Sequence<T> {

  /**
   * @ignore
   */
  public _elements: T[];

  /**
   * @ignore
   */
  public _elementCount: number;

  /**
   * @ignore
   */
  public _allocStep: number;

  /**
   * Construct a new vector.
   *
   * ```ts
   * const v1 = new Vector<number>([1, 2, 3, 4, 5])
   * assert.strictEqual(v.size, 5)
   * ```
   *
   * ```ts
   * const v2 = new Vector<number>({ capacity: 1024 })
   * for (let i = 0; i < 1024; i++) {
   *   v2.append(i)
   * }
   * ```
   *
   * @param iter Any iterable, of which the elements will be copied to this vector.
   * @param opts Additional options to customize the newly created vector.
   */
  constructor(opts: Iterable<T> | VectorOptions<T> = {}) {
    if (isIterable(opts)) {
      const [elements, size] = createArray(opts, DEFAULT_VECTOR_CAPACITY);
      this._elements = elements;
      this._elementCount = size;
      this._allocStep = DEFAULT_VECTOR_ALLOC_STEP;
    } else {
      const capacity = opts.capacity !== undefined ? opts.capacity : DEFAULT_VECTOR_CAPACITY;
      this._allocStep = opts.allocStep !== undefined ? opts.allocStep : DEFAULT_VECTOR_ALLOC_STEP;
      if (opts.elements !== undefined) {
        const [elements, size] = createArray(opts.elements, capacity);
        this._elementCount = size;
        this._elements = elements;
      } else {
        this._elementCount = 0;
        this._elements = new Array(capacity);
      }
    }
  }

  /**
   * Get how much elements this vector can hold before it needs to re-allocate.
   *
   * @see {@link Vector.size}
   */
  public get capacity(): number {
    return this._elements.length;
  }

  /**
   * Ensure the vector can store at least `count` amount of elements.
   * 
   * The {@link size} property of this vector is never changed during this call.
   */
  public allocate(count: number): void {
    this._elements.length = Math.max(this._elements.length, count);
    // if (count <= this._elements.length) {
    //   return;
    // }
    // const newElements = new Array(count);
    // copy(this._elements, newElements, 0, this._elementCount);
    // this._elements = newElements;
  }

  public has(element: T): boolean {
    for (let i = 0; i < this._elementCount; i++) {
      if (this._elements[i] === element) {
        return true;
      }
    }
    return false;
  }

  public replace(index: number, element: T): void {
    if (index < 0 || index >= this._elementCount) {
      throw new RangeError(`Could not replace element: index ${index} out of bounds.`);
    }
    this._elements[index] = element;
  }

  public getAt(index: number) {
    if (index < 0 || index >= this._elementCount) {
      throw new RangeError(`Could not get element: index ${index} out of bounds.`);
    }
    return this._elements[index];
  }

  public shrinkFit() {
    this._elements.length = this._elementCount;
  }

  /**
   * Get how many elements are actually in the container.
   *
   * @see {@link capacity}
   */
  public get size(): number {
    return this._elementCount;
  }

  public insertAfter(pos: VectorCursor<T>, element: T) {
    if (this._elements.length === this._elementCount) {
      this._elements.length += this._allocStep;
    }
    this._elements.copyWithin(pos._index + 2, pos._index + 1, this._elementCount);
    this._elementCount++;
    this._elements[pos._index + 1] = element;
    return new VectorCursor<T>(this, pos._index + 1);
  }

  public insertBefore(pos: VectorCursor<T>, element: T) {
    if (this._elements.length === this._elementCount) {
      this._elements.length += this._allocStep;
    }
    this._elements.copyWithin(pos._index + 1, pos._index, this._elementCount);
    this._elements[pos._index] = element;
    this._elementCount++;
    return new VectorCursor<T>(this, pos._index);
  }

  public slice(a: number, b: number) {
    return new VectorRange<T>(this, a, b, false);
  }

  public first(): T {
    if (this._elementCount === 0) {
      throw new Error(`Could not get first element: collection is empty.`);
    }
    return this._elements[0];
  }

  public last(): T {
    if (this._elementCount === 0) {
      throw new Error(`Could not get last element: collection is empty.`);
    }
    return this._elements[this._elementCount - 1];
  }

  public toRange() {
    return new VectorRange<T>(this, 0, this._elementCount, false);
  }

  public prepend(el: T) {
    if (this._elements.length === this._elementCount) {
      this._elements.length += this._allocStep;
    }
    this._elements.copyWithin(1, 0, this._elementCount);
    this._elements[0] = el;
    this._elementCount++;
    return new VectorCursor<T>(this, 0);
  }

  public append(el: T) {
    if (this._elements.length === this._elementCount) {
      this._elements.length += this._allocStep;
    }
    this._elements[this._elementCount] = el;
    this._elementCount++;
    return new VectorCursor<T>(this, this._elementCount - 1);
  }

  public *[Symbol.iterator]() {
    const elements = this._elements;
    const size = this._elementCount;
    for (let i = 0; i < size; i++) {
      yield elements[i];
    }
  }

  public add(el: T): [boolean, VectorCursor<T>] {
    return [true, this.append(el)];
  }

  public at(position: number): VectorCursor<T> {
    if (position < 0 || position >= this._elementCount) {
      throw new RangeError(`Could not get element at position ${position}: index out of range.`);
    }
    return new VectorCursor(this, position);
  }

  public delete(el: T): boolean {
    for (let i = 0; i < this._elementCount; i++) {
      if (el === this._elements[i]) {
        this._elements.copyWithin(i, i + 1, this._elementCount);
        this._elementCount--;
        return true;
      }
    }
    return false;
  }

  public deleteAtIndex(index: number) {
    this._elements.copyWithin(index, index + 1, this._elementCount);
    this._elementCount--;
  }

  public swap(a: number, b: number) {
    const keep = this.getAt(a);
    this.replace(a, this.getAt(b));
    this.replace(b, keep);
  }

  public deleteAt(pos: VectorCursor<T>) {
    this.deleteAtIndex(pos._index);
  }

  public deleteAll(element: T): number {
    let k = 0;
    let count = 0;
    for (let i = 0; i < this._elementCount; i++) {
      if (element !== this._elements[i]) {
        this._elements[k++] = this._elements[i];
      } else {
        count++;
      }
    }
    this._elementCount = k;
    return count;
  }

  public clear() {
    this._elements = [];
    this._elementCount = 0;
  }

  public clone() {
    return new Vector<T>({
      elements: this,
      capacity: this._elements.length,
      allocStep: this._allocStep,
    });
  }

}

export default Vector;
