
import { Cursor } from "../interfaces"
import { Element, Descriptor, IndexCursor, Index } from "../mi"

export class StructIndex<T, K = T> implements Index<T, K> {

  _indexID: number;
  _descriptor: Descriptor<T>;

  index(name: number | string) {
    return this._descriptor.index(name);
  }

  constructor(public _data: Structure<[T, Element<T>], K>) {

  }

  begin() {
    const pos = this._data.begin();
    if (pos === null)
      return null
    return new IndexCursor<T>(this._descriptor, pos.value[1], this._indexID);
  }

  end() {
    const pos = this._data.end();
    if (pos === null)
      return null
    return new IndexCursor<T>(this._descriptor, pos.value[1], this._indexID);
  }

  _getElement(val: [T, Element<T>]): Element<T> {
    return val[1];
  }

  _getValue(val: [T, Element<T>]): T {
    return val[0];
  }

  _add(el: Element<T>) {
    return this._data.add([el.value, el]);
  }

  find(key: K) {
    const pos = this._data.findKey(key);
    if (pos === null)
      return null;
    return new IndexCursor<T>(this._descriptor, pos.value[1], this._indexID);
  }

  equal(key: K) {
    return this._data.equalKeys(key).map(pair => pair[0]);
  }

  add(val: T) {
    const [added, el] = this._descriptor.add(val);
    if (!added) {
      return [false, el];
    }
    return [added, new IndexCursor<T>(this._descriptor, el, this._indexID)];
  }

  _deleteAt(pos) {
    return this._data.deleteAt(pos);
  }

  delete(key: K) {
    const pos = this._data.findKey(key);
    if (pos !== null) {
      this._descriptor.deleteAt(pos.value[1]);
    }
  }

  deleteAt(pos: IndexCursor<T>) {
    return this._descriptor.deleteAt(pos._el);
  }

  has(el: K) {
    return this._data.hasKey(el);
  }

  *[Symbol.iterator]() {
    for (const pair of this._data) {
      yield pair[1].value;
    }
  }

  size() {
    return this._data.size();
  }

  _clear() {
    this._data.clear();
  }

  clear() {
    this._descriptor.clear();
  }

}

export default StructIndex;

