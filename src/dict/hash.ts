
import { Dict } from "../interfaces"
import List, { Cursor as ListCursor } from "../list/double"
import { Hash, Cursor as HashCursor, Bucket } from "../hash"
import { digest } from "json-hash"
import { equal, find } from "../util"

export class HashDict<K, V> extends Hash<[K, V], K> {

  constructor(
        getHash: (k: K) => number = digest
      , keysEqual: (a: K, b: K) => boolean = equal
      , valuesEqual: (a, b) => boolean = keysEqual
      , size?: number) {
    super(
        getHash
      , keysEqual
      , valuesEqual
      , pair => pair[0]
      , size
    );
  }

  _getConflict(bucket: Bucket<T>, val: [K, V]) {
    const getKey = this.getKey;
    let curr = bucket.begin();
    while (true) {
      if (curr === null) {
        return null;
      }
      if (this.keysEqual(getKey(curr.value), getKey(val))) {
        curr.value = val;
        return curr; 
      }
      curr = curr.next();
    }
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

