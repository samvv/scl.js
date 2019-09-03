
import { Hash, Bucket } from "../../hash"
import { hash, equal } from "../../util"
import { HashDictOptions } from "../hash"

/**
 * A hash-based dictionary that can store multiple items with the same key.
 *
 * ```ts
 * import HashMultiDict from "scl/dict/multi/hash"
 * ```
 *
 * Most methods in this collection, given that a proper hashing function is set
 * up, are in `Θ(1 + n/k)`. If you're out of luck, this characteristic can grow
 * to `O(n)`.
 *
 * You can add as many items with the same key and value as you want, as the
 * items will be stored next to each other.
 *
 * ```ts
 * const d = HashMultiDict.empty<number, string>()
 * d.emplace(1, 'foo') // ok
 * assert.strictEqual(d.getValue(1), 'foo')
 * d.emplace(1, 'bar') // ok
 * d.emplace(1, 'foo') // ok
 * const values = [...d.getValues(1)]
 * assert.strictEqual(values.length, 3)
 * ```
 */
export class HashMultiDict<K, V> extends Hash<[K, V], K> {

  _getConflict(bucket: Bucket<[K, V]>, element: [K, V]) {
    return null;
  }

  static empty<K, V>(opts: HashDictOptions<K, V> = {}) {
    const valuesEqual = opts.valuesEqual !== undefined ? opts.valuesEqual : equal;
    const keysEqual = opts.keysEqual !== undefined ? opts.keysEqual : equal;
    return new HashMultiDict<K, V>(
        opts.hash !== undefined ? opts.hash : hash
      , keysEqual
      , (a, b) => valuesEqual(a[1], b[1])
      , pair => pair[0]
      , opts.capacity
    );
  }

  static from<K, V>(iterable: Iterable<[K, V]>, opts: HashDictOptions<K, V> = {}) {
    const dict = HashMultiDict.empty<K, V>(opts);
    for (const element of iterable) {
      dict.add(element);
    }
    return dict;
  }

  emplace(key: K, val: V) {
    return this.add([key, val])
  }

  *getValues(key: K) {
    for (const cursor of this.equalKeys(key)) {
      yield cursor.value[1];
    }
  }

  clone() {
    const cloned = new HashMultiDict<K, V>(
        this.getHash
      , this.keysEqual
      , this.elementsEqual
      , this.getKey
      , this._array.length
    );
    for (const element of this) {
      cloned.add(element);
    }
    return cloned;
  }

}

export default HashMultiDict;

