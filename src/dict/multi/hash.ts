
import { Hash } from "../../hash"
import { hash, equal } from "../../util"

export class HashMultiDict<K, V> extends Hash<[K, V], K> {

  constructor(
    getHash: (k: K) => number = hash
  , keysEqual: (a: K, b: K) => boolean = equal
  , valuesEqual: (a: V, b: V) => boolean = equal
  , size?: number
  ) {
    super(
        getHash
      , keysEqual
      , (a, b) => keysEqual(a[0], b[0]) && valuesEqual(a[1], b[1])
      , pair => pair[0]
      , size
    );
  }

  emplace(key: K, val: V) {
    return this.add([key, val])
  }

  *getValues(key: K) {
    for (const cursor of this.equalKeys(key)) {
      yield cursor.value[1];
    }
  }

}

export default HashMultiDict;

