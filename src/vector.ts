
import { Vector, View, Cursor } from "./interfaces"

export class Element<T> {

  get value() {
    return this._elements[this._index]; 
  }

  set value(newValue: T) {
    this._elements[this._index] = newValue;
  }

  constructor(public _elements: T[], public _index: number) {
    
  }

  [Symbol.iterator]() {
    let i = this._index, els = this._elements;
    return {
      next() {
        if (i === els.length) {
          return <IteratorResult<T>>{ done: true };
        }
        return { done: false, value: els[i++] };
      }
    }
  }

  next() {
    if (this._index === this._elements.length-1) {
      return null;
    }
    return new Element<T>(this._elements, this._index+1);
  }

  prev() {
    if (this._index === 0) {
      return null;
    }
    return new Element<T>(this._elements, this._index-1);
  }

}

class SlicedArrView<T> implements View<T> {

  constructor(public _elements: T[], public _min = 0, public _max = _elements.length) {
    
  }

  reverse() {
    return new RSlicedArrView<T>(this);
  }

  slice(a: number, b: number) {
    return new SlicedArrView(this._elements, this._min+a, this._min+b);
  }

  [Symbol.iterator]() {
    let i = this._min, els = this._elements, max = this._max;
    return {
      next() {
        if (i === max) {
          return <IteratorResult<T>>{ done: true };
        }
        return { done: false, value: els[i++] };
      }
    }
  }

}

class RSlicedArrView<T> implements View<T> {

  constructor(public _view: SlicedArrView<T>) {

  }

  [Symbol.iterator]() {
    let i = this._view._max, els = this._view._elements, min = this._view._min;
    return {
      next() {
        if (i === min) {
          return <IteratorResult<T>>{ done: true };
        }
        return { done: false, value: els[i--] };
      }
    }
  }

  reverse() {
    return this._view;
  }

};

export class ArrayVector<T> implements Vector<T> {

  _elements: T[];

  constructor(public _elements: T[] = []) {

  }

  allocate(amnt: number) {
    // TODO
    //this._elements.length = this._elements.length+amnt
  }

  has(el: T) {
    return this._elements.indexOf(el) !== -1
  }

  replace(pos: number, val: T) {
    if (pos < 0 || pos >= this._elements.length)
      throw new Error(`invalid position`)
    this._elements[pos] = val
  }

  count(el: T) {
    let res = 0
    for (const othEl of this._elements)
      if (othEl === el) 
        ++res
    return res
  }

  ref(pos: number) {
    return this._elements[pos]
  }

  setSize(size: number) {
    this._elements.length = size
  } 

  size() {
    return this._elements.length
  }

  insertAfter(pos: Element<T>, el: T) {
    this._elements.splice(pos._index+1, 0, el)
  }

  insertBefore(pos: Element<T>, el: T) {
    this._elements.splice(pos._index, 0, el)
  }

  slice(a: number, b: number) {
    return new SlicedArrView<T>(this._elements, a, b);
  }

  first() {
    if (this._elements.length === 0)
      throw new Error(`container is empty`)
    return this._elements[0]
  }

  last() {
    if (this._elements.length === 0)
      throw new Error(`container is empty`)
    return this._elements[this._elements.length-1]
  }

  begin() {
    return new Element(this._elements, 0);
  }

  end() {
    return new Element(this._element, this._elements.length-1);
  }

  prepend(el: T) {
    this._elements.unshift(el)
  }

  append(el: T) {
    this._elements.push(el)
  }

  [Symbol.iterator]() {
    return this._elements[Symbol.iterator]()
  }

  add(el: T) {
    this._elements.push(el)
  }

  at(count: number): Element<T> {
    if (count < 0 || count > this._elements.length)
      return null;
    return new Element(this._elements, count);
  }

  deleteAt(pos: Element<T>) {
    this._elements.splice(pos._index, 1);
  }

  deleteAll(el: T) {
    this._elements = this._elements.filter(other => el === other)
  }

  clear() {
    this._elements.splice(0, this._elements.length)
  }

  clone() {
    return new ArrayVector(this._elements.slice())
  }

}

export default ArrayVector

