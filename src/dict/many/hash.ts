
import { Bucket, SingleElementHash } from "../../hash"
import { Dict } from "../../interfaces"
import { hash, equal } from "../../util"

export class HashManyDict<K, V> extends SingleElementHash<[K, V], K> implements Dict<K, V> {

  constructor(
        getHash: (k: K) => number = hash
      , keysEqual: (a: K, b: K) => boolean = equal
      , public _valuesEqual: (a: V, b: V) => boolean = equal 
      , elementsEqual: (a: [K, V], b: [K, V]) => boolean = (a, b) => a === b
      , size?: number) {
    super(
        getHash
      , keysEqual
      , elementsEqual
      , pair => pair[0]
      , size
    );
  }
  
  emplace(key: K, val: V) {
    return this.add([key, val]);
  }

  add(val: [K, V]) {
    const [added, pos] = super.add(val);
    if (!added) {
      pos.value = val;
    }
    return pos; 
  }

}

export default HashManyDict

