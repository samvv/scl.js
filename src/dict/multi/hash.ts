
import { Hash } from "../../hash"
import { DictBase } from "./base"
import { digest } from "json-hash"
import { equal } from "../../util"

export class HashMultiDict<K, V> extends DictBase<K, V> {

  constructor(
        public getHash: (k: K) => number = digest
      , public isEqual: (a: K, b: K) => boolean = equal
      , valuesEqual: (a: V, b: V) => boolean = isEqual
    , size?: number) {
    super(valuesEqual);
    this._data = new Hash(
      (el: [K, V]) => getHash(el[0])
      , (a: [K, V], b: [K, V]) => isEqual(a[0], b[0])
      , size);
  }

}

export default HashMultiDict;

