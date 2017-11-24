
import { TreeSet } from "../../set/tree"
import { Bucket, Hash, Element } from "../../hash"
import { Dict } from "../../interfaces"
import { DictBase } from "../multi/base"
import { digest } from "json-hash"
import { equal } from "../../util"

class ManyHash<K, V> extends Hash<[K, V]> {

  constructor(
        getHash: (el: [K, V]) => number
      , isEqual: (a: [K, V], b: [K, V]) => boolean
      , public _valuesEqual
      , size?: number) {
    super(getHash, isEqual, size);
  }

  _getConflict(bucket: Bucket<[K, V]>, val: [K, V]) {
    for (const el of bucket) {
      if (this.isEqual(el.value, val) && this._valuesEqual(el.value[1], val[1])) {
        el.value = val;
        return el;
      }
    }
    return null;
  }

}

export class HashManyDict<K, V> extends DictBase<K, V> {

  constructor(
        public getHash: (k: K) => number = digest
      , public isEqual: (a: K, b: K) => boolean = equal
      , valuesEqual: (a: V, b: V) => boolean = isEqual
    , size?: number) {
    super(valuesEqual);
    this._data = new ManyHash(
      (el: [K, V]) => getHash(el[0])
      , (a: [K, V], b: [K, V]) => isEqual(a[0], b[0])
      , valuesEqual
      , size);
  }

}

export default HashManyDict

