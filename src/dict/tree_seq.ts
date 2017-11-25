
import AVL from "../avl"
import { Dict, Cursor } from "../interfaces"
import DLList, { Cursor as DLCursor } from "../list/double"
import { lesser } from "../util"

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

export class SeqTreeDict<K, V> {

  _list = new DLList<SeqElement<[K, V]>>();
  _tree: AVL<SeqElement<[K, V]>>;

  constructor(
      public lessThan: (a: K, b: K) => boolean = lesser
    , valuesEqual = (a, b) => !lessThan(a, b) && !lessThan(b, a)) {
    this._tree = new AVL<SeqElement<[K, V]>>(
      (el, key) => {
        if (lessThan(el.value[0], key))
          return -1;
        if (lessThan(key, el.value[0]))
          return 1;
        return 0;
      }
      , false
    );
  }

  emplace(k: K, v: V) {
    return this.add([k, v]);
  }

  add(p: [K, V]) {
    let el = new SeqElement(p);
    const [added, treePos] = this._tree.add(el);
    if (!added) {
      console.log('existing element', p);
      el = treePos.value;
      el.value = p;
      this._list.deleteAt(el._listPos);
    } else {
      console.log('new element', p);
      el._treePos = treePos;
    }
    el._listPos = this._list.append(el);
    return el;
  }

  *[Symbol.iterator]() {
    for (const el of this._list) {
      yield el.value;
    }
  }

  delete(p: [K, V]) {
    const el = new SeqElement(p);
    this._tree.deleteAt(el._treePos);
    this._list.deleteAt(el._listPos);
  }

}

export default SeqTreeDict;

