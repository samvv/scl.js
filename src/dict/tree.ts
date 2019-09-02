
import AVL from "../avl"
import { lesser, equal } from "../util"

export class TreeDict<K, V> extends AVL<[K, V], K> {

  constructor(
    lessThan: (a: K, b: K) => boolean = lesser,
    valuesEqual: (a: V, b: V) => boolean = equal
  ) {
    const keysEqual = (a: K, b: K) => !lessThan(a, b) && !lessThan(b, a);
    super(
        /* keyLessThan */ lessThan
      , /* getKey */ pair => pair[0]
      , /* elementsEqual */ (a, b) => keysEqual(a[0], b[0]) && valuesEqual(a[1], b[1])
      , /* allowDuplicates */ false
    );
  }

  emplace(key: K, val: V) {
    return this.add([key, val]);
  }

  add(p: [K, V]) {
    const hint = this.getAddHint(p);
    if (hint[0] === false) {
      hint[1]!.value = p;
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

