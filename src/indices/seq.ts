
import { Sequence, Cursor } from "../interfaces"
import { Element, Descriptor, Index, IndexCursor } from "../mi"

export class SeqIndex<T> implements Sequence<T>, Index<T, T> { 

  _indexID: number;
  _descriptor: Descriptor<T>;

  constructor(public _seq: Sequence<Element<T>>) {

  }

  _deleteAt(pos) {
    this._seq.deleteAt(pos)
  }

  _getElement(val: Element<T>): Element<T> {
    return val;
  }

  _getValue(val: T): T {
    return val;
  }

  *[Symbol.iterator]() {
    for (const el of this._seq) {
      yield el.value;
    }
  }

  begin() {
    const pos = this._seq.begin();
    if (pos === null)
      return null
    return pos.value;
  }

  end() {
    const pos = this._seq.end();
    if (pos === null)
      return null
    return pos.value;
  }

  index(name: string | number) {
    return this._descriptor.index(name);
  }

  has(el: T) {
    return this._descriptor.has(el);
  }

  find(el: T) {
    return this._descriptor.find(el);
  }

  size() {
    return this._seq.size();
  }

  _clear() {
    this._seq.clear();
  }

  clear() {
    this._descriptor.clear();
  }

  first() {
    return this._seq.first();
  }

  last() {
    return this._seq.last();
  }

  insertBefore(val: T, pos: IndexCursor<T>) {
    const [added, el] = this._descriptor._add(this, val);
    const newPos = new IndexCursor(this._descriptor, el, this._indexID);
    if (!added) {
      return [false, newPos]
    }
    el._cursors[this._indexID] = this._seq.insertBefore(pos._el._cursors[this._indexID], el);

    return [true, newPos];
  }

  insertAfter(val: T, pos: IndexCursor<T>) {
    const [added, el] = this._descriptor._add(this, val);
    const newPos = new IndexCursor(this._descriptor, el, this._indexID);
    if (!added) {
      return [false, newPos]
    }
    el._cursors[this._indexID] = this._seq.insertAfter(pos._el._cursors[this._indexID], el);
    return [true, newPos];
  }

  append(val: T) {
    const [added, el] = this._descriptor._add(this, val);
    const newPos = new IndexCursor(this._descriptor, el, this._indexID);
    if (!added) {
      return [false, newPos]
    }
    el._cursors[this._indexID] = this._seq.append(el);
    return [true, newPos];
  }

  prepend(val: T) {
    const [added, el] = this._descriptor._add(this, val);
    const newPos = new IndexCursor(this._descriptor, el, this._indexID);
    if (!added) {
      return [false, newPos]
    }
    el._cursors[this._indexID] = this._seq.prepend(el);
    return [true, newPos];
  }

  deleteAt(pos: IndexCursor<T>) {
    this._descriptor.deleteAt(pos._el);
  }

}

export default SeqIndex;

