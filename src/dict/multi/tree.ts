
import { DictBase } from "../multi/base"
import AVL from "../../avl"
import { lesser, liftLesser } from "../../util"

export class TreeDict<K, V> extends AVL<[K, V], K> {

  constructor(
      lessThan: (a: K, b: K) => boolean = lesser
    , valuesEqual: (a: V, b: V) => boolean = (a, b) => a === b) {
    super(
      liftLesser(lessThan)
    , pair => pair[0]
    , (a, b) => !lessThan(a[0], b[0]) && !lessThan(b[0], a[0]) && valuesEqual(a[1], b[1])
    , true
    );
  }

  getValues(key: K) {
    return this.equalKeys(key).map(pair => pair[1]);
  }

  emplace(key: K, val: V) {
    return this.add([key, val]);
  }

}

export default TreeDict;
