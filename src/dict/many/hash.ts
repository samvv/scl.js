
import { SingleValueHash, HashCursor } from "../../hash/index"
import { MultiDict } from "../../interfaces"
import { hash, equal } from "../../util"

export class HashManyDict<K, V> extends SingleValueHash<[K, V], K> implements MultiDict<K, V> {

  constructor(
        getHash: (k: K) => number = hash
      , keysEqual: (a: K, b: K) => boolean = equal
      , valuesEqual: (a: V, b: V) => boolean = equal 
      , size?: number) {
    super(
        getHash
      , keysEqual
      , (a, b) => keysEqual(a[0], b[0]) && valuesEqual(a[1], b[1])
      , pair => pair[0]
      , size
    );
  }

  emplace(key: K, val: V) {
    return this.add([key, val]);
  }

  *getValues(key: K): IterableIterator<V> {
    for (const cursor of this.equalKeys(key)) {
      yield cursor.value[1];
    }
  }

  add(val: [K, V]): [boolean, HashCursor<[K, V]>] {
    const [added, cursor] = super.add(val);
    if (added === false) {
      cursor.value = val;
    }
    return [added, cursor]; 
  }

}

export default HashManyDict

