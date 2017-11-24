
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
    this._data = new AVL((a: [K, V], b: [K, V]) => lessThan(a[0], b[0]), 0);
  }
}

export default TreeDict;

