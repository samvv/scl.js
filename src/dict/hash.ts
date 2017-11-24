
import DLList from "../list/double"
import { Element, Hash, Bucket } from "../hash"
import { digest } from "json-hash"
import { equal } from "../util"
import { DictBase } from "./base"

export class SingleHash<K, V> extends Hash<[K, V]> {
  _getConflict(bucket: Bucket<[K, V]>, val: [K, V]) {
    for (const el of bucket) {
      if (this.isEqual(el.value, val)) {
        el.value = val;
        return el;
      }
    }
    return null;
  }
}

export class HashDict<K, V = K> extends DictBase<K, V> {
  constructor(
      public getHash: (k: K) => number = digest
      , public isEqual: (a: K, b: K) => boolean = equal
      , valuesEqual: (a, b) => boolean = isEqual
      , size?: number) {
    super(valuesEqual);
    this._data = new SingleHash(
      (el: [K, V]) => getHash(el[0])
      , (a: [K, V], b: [K, V]) => isEqual(a[0], b[0])
      , size
    );
  }
}

export default HashDict;

