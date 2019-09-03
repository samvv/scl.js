
import { Hash, Bucket, HashCursor } from "../../hash/index"
import { MultiDict } from "../../interfaces"
import { HashDictOptions } from "../hash"
import { hash, equal } from "../../util"

/**
 * A hash-based dictionary that can store multile items with the same key, but
 * only if the values differ.
 *
 * ```ts
 * import HashManyDict from "scl/dict/many/hash"
 * ```
 *
 * Most methods in this collection, given that a proper hashing function is set
 * up, are in `Θ(1 + n/k)`. If you're out of luck, this characteristic can grow
 * to `O(n)`.
 * 
 * When a new entry is added with a key and a value that is already taken, the
 * dictionary will replace the corresponding entry with the new one.
 *
 * ```ts
 * const d = HashManyDict.empty<number, string>()
 * d.emplace(1, 'foo') // ok
 * assert.strictEqual(d.getValue(1), 'foo')
 * d.emplace(1, 'bar') // ok
 * d.emplace(1, 'foo') // ok; replaced
 * const values = [...d.getValues(1)]
 * assert.deepInclude(value, [1, 'foo'])
 * assert.deepInclude(value, [1, 'bar'])
 * ```
 *
 * @typeparam K The type of key of a given entry.
 * @typeparam V The type of value associated with the given key.
 */
export class HashManyDict<K, V> extends Hash<[K, V], K> implements MultiDict<K, V> {

  _getConflict(bucket: Bucket<[K, V]>, val: [K, V]) {
    for (const cursor of bucket.toRange()) {
      if (this.elementsEqual(cursor.value, val)) {
        return cursor;
      }
    }
    return null;
  }

  static empty<K, V>(opts: HashDictOptions<K, V> = {}) {
    const valuesEqual = opts.valuesEqual !== undefined ? opts.valuesEqual : equal;
    const keysEqual = opts.keysEqual !== undefined ? opts.keysEqual : equal;
    return new HashManyDict<K, V>(
        opts.hash !== undefined ? opts.hash : hash
      , keysEqual
      , (a, b) => valuesEqual(a[1], b[1])
      , pair => pair[0]
      , opts.capacity
    );
  }

  static from<K, V>(iterable: Iterable<[K, V]>, opts: HashDictOptions<K, V> = {}) {
    const dict = HashManyDict.empty<K, V>(opts);
    for (const element of iterable) {
      dict.add(element);
    }
    return dict;
  }

  emplace(key: K, val: V) {
    return this.add([key, val]);
  }

  *getValues(key: K): IterableIterator<V> {
    for (const cursor of this.equalKeys(key)) {
      yield cursor.value[1];
    }
  }

  add(val: [K, V]): [boolean, HashCursor<[K, V]>] {
    const [added, cursor] = super.add(val);
    if (added === false) {
      cursor.value = val;
    }
    return [added, cursor]; 
  }

  clone() {
    const cloned = new HashManyDict<K, V>(
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

export default HashManyDict

