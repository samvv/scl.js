
import AVL from "../../avl"
import { Container, Dict, Cursor, View } from "../../interfaces"
import DLList, { Cursor as DLCursor } from "../../list/double"
import TreeDict from "../tree_seq"
import { lesser, mapView } from "../../util"

export class EmptyView<T> {
  reverse() { return this; };
  *[Symbol.iterator]() { };
}

export class DictCursor<K, V> {

  constructor(public _el: SeqElement<[K, DLList<[K,V]>]>, public _valPos: DLCursor<[K,V]>) {

  }

  get value() {
    return this._valPos.value;
  }

  set value(newVal: [K, V]) {
    this._valPos.value = newVal;
  }

  next() {
    let el = this._el;
    while (true) {
      const nextValue = this._valPos.next();
      if (nextValue !== null) {
        return new DictCursor(el, nextValue);
      }
      const next = this._el._treePos.next();
      if (next === null) {
        break;
      } else {
        el = next.value;
      }
    }
    return null;
  }

  prev() {
    let el = this._el;
    while (true) {
      const prevValue = this._valPos.prev();
      if (prevValue !== null) {
        return new DictCursor(el, prevValue);
      }
      const prev = this._el._treePos.prev();
      if (prev === null) {
        break;
      } else {
        el = prev.value;
      }
    }
    return null;
  }

}

export class SeqElement<T> {

  _listPos: DLCursor<SeqElement<T>>;
  _treePos: Cursor<SeqElement<T>>;

  constructor(public value: T, public _index = 0) {

  }

  next() {
    return this._listPos.next();
  }

  prev() {
    return this._listPos.prev();
  }

}

type DictElement<K, V> = SeqElement<[K, Container<[K,V]>]>;

export class SeqTreeMultiDict<K, V> {

  _list = new DLList<DictCursor<K, V>>();
  _tree: AVL<DictElement<K,V>>;

  constructor(
        public lessThan: (a: K, b: K) => number = lesser
      , public valuesEqual = (a, b) => !lessThan(a, b) && !lessThan(b, a)
      , public _createSet = () => new DLList<[K,V]>()) {
    this._tree = new AVL<SeqElement<[K, DLList<V>]>>(
      (el, key) => {
        console.log(el.value[0], key);
        if (lessThan(el.value[0], key))
          return -1;
        if (lessThan(key, el.value[0]))
          return 1;
        console.log('equa!');
        return 0;
      }
      , false
    );
  }

  getValues(key: K) {
    const el = this._tree.find(key);
    if (el === null) {
      return new EmptyView();
    }
    return mapView(el.value.value[1], pair => pair[1]);
  }

  emplace(k: K, v: V) {
    return this.add([k, v]);
  }

  find(p: [K, V]) {
    const treePos = this._tree.find(p);
    let valPos = treePos.value[1].begin();
    while (valPos !== null) {
      const nextPos = valPos.next();
      if (this.valuesEqual(valPos.value.value, p[1])) {
        break;
      }
      valPos = valPos.next();
    }
    if (valPos === null) {
      return null;
    }
    return new DictCursor<K, V>(treePos.value, valPos);
  }

  add(p: [K, V]) {
    const [added, treePos] = this._tree.add(p[0], () => new SeqElement<[K, DLList<[K, V]>]>([p[0], this._createSet()]));
    const el = treePos.value;
    const valPos = el.value[1].append(p);
    const cursor = new DictCursor<K, V>(el, valPos);
    el._listPos = this._list.append(cursor);
    el._treePos = treePos;
    return 
  }

  *[Symbol.iterator]() {
    for (const cursor of this._list) {
      yield cursor.value;
    }
  }

  deleteKey(key: K) {
    this._tree.delete([key, null]);
  }

  delete(p: [K, V]) {
    const pos = this.find(p);
    if (pos === null) {
      return;
    }
    const vs = pos._el._treePos.value;
    vs[1].deleteAt(pos._valPos);
    if (vs[1].size() === 0) {
      this._tree.deleteAt(pos._el._treePos);
    }
    this._list.deleteAt(pos._el._listPos);
  }

}

export default SeqTreeMultiDict;

