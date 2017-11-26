
import { Hash } from "../../hash"
import { digest } from "json-hash"
import { equal, mapView } from "../../util"

export class HashMultiDict<K, V> extends Hash<[K, V], K> {

  constructor(
        getHash: (k: K) => number = digest
      , isEqual: (a: K, b: K) => boolean = equal
      , valuesEqual: (a: [K, V], b: [K, V]) => boolean = (a, b) => a === b
    , size?: number) {
    super(
        getHash
      , isEqual
      , valuesEqual
      , pair => pair[0]
      , size
    );
  }

  getValues(key: K) {
    return mapView(this.equalKeys(key), pair => pair[1]);
  }

}

export default HashMultiDict;

