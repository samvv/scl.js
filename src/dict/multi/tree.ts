
import AVL from "../../avl"
import { lesser } from "../../util"
import { MultiDict } from "../../interfaces"

export class TreeMultiDict<K, V> extends AVL<[K, V], K> implements MultiDict<K, V> {

  valuesEqual: (a: V, b: V) => boolean;

  constructor(
      keyLessThan: (a: K, b: K) => boolean = lesser
    , valuesEqual: (a: V, b: V) => boolean = (a, b) => a === b
  ) {
    const keysEqual = (a: K, b: K) => !keyLessThan(a, b) && !keyLessThan(b, a);
    super(
      /* keyLessThan */ keyLessThan
    , /* getKey */ pair => pair[0]
    , /* elementsEqual */ (a, b) => keysEqual(a[0], b[0]) && valuesEqual(a[1], b[1])
    , /* allowDuplicates */ true
    );
    this.valuesEqual = valuesEqual;
  }

  *getValues(key: K) {
    for (const cursor of this.equalKeys(key)) {
      yield cursor.value[1];
    }
  }

  emplace(key: K, val: V) {
    return this.add([key, val]);
  }

}

export default TreeMultiDict;

