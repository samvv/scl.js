
import { Collection, Sequence, CollectionRange, Cursor } from "./interfaces"
import { isIterable } from "./util"

/**
 * @ignore
 */
export class VectorCursor<T> {

  get value() {
    return this.vector._elements[this._index]; 
  }

  set value(newValue: T) {
    this.vector._elements[this._index] = newValue;
  }

  constructor(public vector: Vector<T>, public _index: number) {
    
  }

  *[Symbol.iterator]() {
    const elements = this.vector._elements;
    const size = this.vector._size;
    for (let i = this._index; i < size; ++i) {
      yield elements[i];
    }
  }

  next() {
    if (this._index === this.vector._size-1) {
      return null;
    }
    return new VectorCursor<T>(this.vector, this._index+1);
  }

  prev() {
    if (this._index === 0) {
      return null;
    }
    return new VectorCursor<T>(this.vector, this._index-1);
  }

}

/**
 * @ignore
 */
export class VectorRange<T> implements CollectionRange<T> {

  constructor(public _vector: Vector<T>, public _min: number, public _max: number, public _reversed: boolean) {
    
  }

  get size() {
    return this._max - this._min;
  }

  slice(a: number, b: number) {
    return new VectorRange<T>(this._vector, this._min + a, this._min + b, this._reversed);
  }

  *values() {
    if (this._reversed) {
      for (let i = this._max; i >= this._min; i--) {
        yield this._vector._elements[i];
      }
    } else {
      for (let i = this._min; i < this._max; ++i) {
        yield this._vector._elements[i];
      }
    }
  }

  *[Symbol.iterator]() {
    if (this._reversed) {
      for (let i = this._max; i >= this._min; i--) {
        yield new VectorCursor<T>(this._vector, i);
      }
    } else {
      for (let i = this._min; i < this._max; ++i) {
        yield new VectorCursor<T>(this._vector, i);
      }
    }
  }

  reverse() {
    return new VectorRange<T>(this._vector, this._min, this._max, !this._reversed);
  }

}

function copy<T>(
  src: T[], 
  dst: T[], 
  dstStart: number = 0,
  srcStart: number = 0, 
  srcEnd: number = src.length
) {
  for (let i = 0; i < srcEnd - srcStart; i++) {
    dst[dstStart + i] = src[srcStart + i];
  }
}

const DEFAULT_INIT_SIZE = 1024;
const DEFAULT_ALLOC_STEP = 255;

/**
 * Options to be passed to the constructor of [[Vector]].
 *
 * You don't have to specify these values, as the vector implementation will 
 * attempt to load sane defaults.
 *
 * @see [[Vector.constructor]]
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
 * import Vector from "scl/vector"
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
 * | {@link Vector.insertAfter insertAfter()}   | O(n)       |
 * | {@link Vector.insertBefore insertBefore()} | O(n)       |
 * | {@link Vector.deleteAt deleteAt()}         | O(n)       |
 * | {@link Vector.prepend prepend()}           | O(n)       |
 * | {@link Vector.size size}                   | O(1)       |
 * 
 * @see [[DoubleLinkedList]]
 * @see [[SingleLinkedList]]
 *
 * @typeparam T The type of element in the collection.
 */
export class Vector<T> implements Sequence<T> {

  /**
   * @ignore
   */
  _elements: T[];
  /**
   * @ignore
   */
  _size: number;

  /**
   * @ignore 
   */
  _allocStep: number;

  /**
   * Construct a new vector, optionally filled with the given elements.
   *
   * ```ts
   *  const v1 = new Vector([1, 2, 3, 4, 5])
   *  assert.strictEqual(v.size, 5)
   * ```
   *
   * @param opts Any iterable, of which the elements will be copied to this vector.
   */
  constructor(opts: Iterable<T> | VectorOptions<T> = {}) {
    if (isIterable(opts)) {
      opts = { elements: opts };
    }
    const capacity = opts.capacity !== undefined ? opts.capacity : DEFAULT_INIT_SIZE;
    this._allocStep = opts.allocStep !== undefined ? opts.allocStep : DEFAULT_ALLOC_STEP;
    if (opts.elements !== undefined) {
      this._elements = [...opts.elements];
      this._size = this._elements.length;
      this._elements.length += Math.max(this._elements.length, capacity);
    } else {
      this._elements = new Array(capacity);
      this._size = 0;
    }
  }

  /**
   * Get how much elements this vector can hold before it needs to re-allocate.
   *
   * @see [[Vector.size]]
   */
  get capacity() {
    return this._elements.length;
  }

  /**
   * Allocates the specified amount of free space at the end of the vector for
   * storing data, without changing its `size()`.
   */
  allocate(count: number) {
    if (count <= this._elements.length) {
      return;
    }
    const newElements = new Array(count);
    copy(this._elements, newElements, 0, this._size);
    this._elements = newElements;
  }


  has(element: T) {
    for (let i = 0; i < this._size; i++) {
      if (this._elements[i] === element) {
        return true;
      }
    }
    return false;
  }

  replace(index: number, element: T) {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Could not replace element: index ${index} out of bounds.`);
    }
    this._elements[index] = element;
  }

  getAt(index: number) {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Could not replace element: index ${index} out of bounds.`);
    }
    return this._elements[index];
  }

  shrinkFit() {
    this._elements.length = this._size;
  } 

  /**
   * Get how many elements are actually in the container.
   *
   * @see [[Vector.capacity]]
   */
  get size() {
    return this._size;
  }

  insertAfter(pos: VectorCursor<T>, element: T) {
    if (this._elements.length === this._size) {
      this._elements.length += this._allocStep;
    }
    this._elements.copyWithin(pos._index + 2, pos._index + 1, this._size);
    this._size++;
    this._elements[pos._index + 1] = element;
    return new VectorCursor<T>(this, pos._index + 1);
  }

  insertBefore(pos: VectorCursor<T>, element: T) {
    if (this._elements.length === this._size) {
      this._elements.length += this._allocStep;
    }
    this._elements.copyWithin(pos._index + 1, pos._index, this._size);
    this._elements[pos._index] = element;
    this._size++;
    return new VectorCursor<T>(this, pos._index);
  }

  slice(a: number, b: number) {
    return new VectorRange<T>(this, a, b, false);
  }

  first() {
    if (this._size === 0) {
      throw new Error(`Could not get first element: collection is empty.`)
    }
    return this._elements[0]
  }

  last() {
    if (this._size === 0) {
      throw new Error(`Could not get last element: collection is empty.`)
    }
    return this._elements[this._size-1]
  }

  toRange() {
    return new VectorRange<T>(this, 0, this._size, false);
  }

  prepend(el: T) {
    if (this._elements.length === this._size) {
      this._elements.length += this._allocStep;
    }
    this._elements.copyWithin(1, 0, this._size)
    this._elements[0] = el;
    this._size++;
    return new VectorCursor<T>(this, 0);
  }

  append(el: T) {
    if (this._elements.length === this._size) {
      this._elements.length += this._allocStep;
    }
    this._elements[this._size] = el;
    this._size++;
    return new VectorCursor<T>(this, this._size-1)
  }

  *[Symbol.iterator]() {
    const elements = this._elements;
    const size = this._size;
    for (let i = 0; i < size; i++) {
      yield elements[i];
    }
  }

  add(el: T): [boolean, Cursor<T>] {
    return [true, this.append(el)];
  }

  at(position: number): VectorCursor<T> {
    if (position < 0 || position >= this._size) {
      throw new RangeError(`Could not get element at position ${position}: index out of range.`);
    }
    return new VectorCursor(this, position);
  }

  delete(el: T): boolean {
    for (let i = 0; i < this._size; i++) {
      if (el === this._elements[i]) {
        this._elements.copyWithin(i, i+1, this._size);
        this._size--;
        return true;
      }
    }
    return false;
  }

  deleteAtIndex(index: number) {
    this._elements.copyWithin(index, index + 1, this._size);
    this._size--;
  }

  deleteAt(pos: VectorCursor<T>) {
    this.deleteAtIndex(pos._index);
  }

  deleteAll(element: T): number {
    let k = 0;
    let count = 0;
    for (let i = 0; i < this._size; i++) {
      if (element !== this._elements[i]) {
        this._elements[k++] = this._elements[i];
      } else {
        count++;
      }
    }
    this._size = k;
    return count;
  }

  clear() {
    this._elements = [];
    this._size = 0;
  }

  clone() {
    return new Vector<T>(this);
  }

}

export default Vector

