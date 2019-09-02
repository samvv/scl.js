
import { Dict } from "../interfaces"
import { SingleKeyHash } from "../hash"
import { hash, equal } from "../util"

function strictEqual(a: any, b: any): boolean {
  return a === b;
}

export class HashDict<K, V> extends SingleKeyHash<[K, V], K> implements Dict<K, V> {

  constructor(
        getHash: (k: K) => number = hash
      , keysEqual: (a: K, b: K) => boolean = equal
      , valuesEqual: (a: V, b: V) => boolean = strictEqual
      , size?: number) {
    super(
        getHash
      , keysEqual
      , (a, b) => valuesEqual(a[1], b[1])
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

