
import { digest } from "json-hash"
import AVL from "../avl"
import { lesser, equal, liftLesser } from "../util"

export class TreeDict<K, V> extends AVL<[K, V], K> {

  constructor(lessThan: (a: K, b: K) => boolean = lesser, isEqual = (a, b) => a === b) {
    super(
        lessThan
      , pair => pair[0]
      , isEqual
      , false
    );
  }

  add(p: [K, V]) {
    const hint = this.addHint(p[0]);
    if (!hint[0]) {
      hint[1].value = p;
    }
    return super.add(p, hint);
  }

  getValue(key: K) {
    const match = this.findKey(key);
    if (match !== null) {
      return match.value[1];
    }
    return null;
  }

}

export default TreeDict;

