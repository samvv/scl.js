
import { DictBase } from "./base"
import { digest } from "json-hash"
import { equal } from "../util"
import AVL from "../avl"
import { lesser } from "../util"

export class TreeDict<K, V> extends DictBase<K, V> {
  constructor(
      public lessThan: (a: K, b: K) => boolean = lesser
    , valuesEqual = (a, b) => !lessThan(a, b) && !lessThan(b, a)) {
    super(valuesEqual);
    this._data = new AVL((a: [K, V], b: [K, V]) => lessThan(a[0], b[0]), true);
  }

  //add(pair: [K, V]) {
    //return this._tree.insert(pair);
  //}

  //getValue(key: K) {
    //const vs = [...this._tree.equal([key, null])];
    //if (vs.length > 0) {
      //return vs[0][1];
    //}
  //}

  //has(pair: [K, V]) {
    //for (const other of this._tree.equal(pair)) {
      //if (this.valuesEqual(pair[1], other[1])) {
        //return true;
      //}
    //}
    //return false;
  //}

  //[Symbol.iterator]() {
    //return this._tree[Symbol.iterator]();
  //}

  //emplace(key: K, value: V) {
    //this.add([key, value]);
  //}

  //deleteAt(pos: Cursor<[K, V]>) {
    //this._tree.remove(pos);
  //}

}

export default TreeDict;

