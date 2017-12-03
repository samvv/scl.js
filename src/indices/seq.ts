
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

  insertBefore(val: T, c: Element<T>) {
    const [added, el] = this._descriptor._add(this, val);
    if (!added) {
      return [false, el]
    }
    el._cursors[this._indexID] = this._seq.insertBefore(c._cursors[this._indexID], el);
    return [true, el._cursors[this._indexID]];
  }

  insertAfter(val: T, pos: Element<T>) {
    const [added, el] = this._descriptor._add(this, val);
    if (!added) {
      return [false, el]
    }
    el._cursors[this._indexID] = this._seq.insertAfter(pos._cursors[this._indexID], el);
    return [true, el._cursors[this._indexID]];
  }

  append(val: T) {
    const [added, el] = this._descriptor._add(this, val);
    if (!added) {
      return [false, el]
    }
    el._cursors[this._indexID] = this._seq.append(el);
    return [true, el._cursors[this._indexID]];
  }

  prepend(val: T) {
    const [added, el] = this._descriptor._add(this, val);
    if (!added) {
      return [false, el]
    }
    el._cursors[this._indexID] = this._seq.prepend(el);
    return [true, el._cursors[this._indexID]];
  }

  deleteAt(pos: IndexCursor<T>) {
    this._descriptor.deleteAt(pos._el);
  }

}

export default SeqIndex;

