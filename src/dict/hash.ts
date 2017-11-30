
import { Dict } from "../interfaces"
import { SingleKeyHash } from "../hash"
import { hash, equal, find } from "../util"

export class HashDict<K, V> extends SingleKeyHash<[K, V], K> {

  constructor(
        getHash: (k: K) => number = hash
      , keysEqual: (a: K, b: K) => boolean = equal
      , valuesEqual: (a, b) => boolean = (a, b) => a === b
      , size?: number) {
    super(
        getHash
      , keysEqual
      , valuesEqual
      , pair => pair[0]
      , size
    );
  }

  emplace(key: K, val: V) {
    return this.add([key, val]);
  }

  getValue(key: K) {
    const match = this.findKey(key);
    if (match !== null) {
      return match.value[1];
    }
    return null;
  }

}

export default HashDict;

