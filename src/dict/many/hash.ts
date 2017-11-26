
import { TreeSet } from "../../set/tree"
import { Bucket, Hash, Element } from "../../hash"
import { Dict } from "../../interfaces"
import MultiHashDict from "../multi/hash"
import { digest } from "json-hash"
import { equal } from "../../util"

export class HashManyDict<K, V> extends MultiHashDict<K, V> {

  _getConflict(bucket: Bucket<[K, V]>, val: [K, V]) {
    const getKey = this.getKey;
    const key = getKey(val);
    let curr = bucket.begin();
    while (true) {
      if (curr === null)
        return null;
      if (this.keysEqual(getKey(curr.value), key) && this.valuesEqual(curr.value[1], val[1]))
        return curr;
      curr = curr.next();
    }
  }

  constructor(
        getHash: (k: K) => number = digest
      , keysEqual: (a: K, b: K) => boolean = equal
      , public valuesEqual: (a: V, b: V) => boolean = equal 
      , elementsEqual: (a: [K, V], b: [K, V]) => boolean = (a, b) => a === b
      , size?: number) {
    super(
        getHash
      , keysEqual
      , elementsEqual
      , size
    );
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

