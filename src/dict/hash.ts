
import { Dict } from "../interfaces"
import { Hash, Bucket } from "../hash"
import { hash, equal } from "../util"

/**
 * Options passed to a hash-like dictionary in order to configure its behaviour.
 *
 * The following example demonstrates a dictionary with a capacity of 1024 and
 * a hashing function that simply returns the integer itself.
 *
 * ```ts
 * const d = HashDict.empty<number, string>({
 *   capacity: 1024,
 *   hash: key => key,
 *   keysEqual: key => key === key,
 *   valuesEqual: value => value === value
 * })
 * ```
 *
 * @see [[HashDict]]
 * @see [[HashManyDict]]
 * @see [[HashMultiDict]]
 */
export interface HashDictOptions<K, V> {

  /**
   * The hashing function that will be used to map entries to a certain bucket.
   *
   * If omitted, the [[hash built-in hash function]] will be used.
   */
  hash?: (key: K) => number;

  /**
   * A predicate for determining when two keys are equal.
   * 
   * Two keys may produce the same hash result, but that does not necessarily
   * mean that they are equal. This function resolves any conflicts.
   *
   * If omitted, the [[equal built-in equality function]] will be used.
   */
  keysEqual?: (a: K, b: K) => boolean;

  /**
   * A predicate determining when two elements are equal.
   *
   * This function is only called after is has been determined that the keys
   * are equal, so you may safely skip the equality check for the keys.
   *
   * If omitted, the [[equal built-in equality function]] will be used.
   */
  valuesEqual?: (a: V, b: V) => boolean;

  /**
   * The initial capacity of the underling vector that will store the buckets.
   */
  capacity?: number;

}

/**
 * A simple hash-based dictionary that only allows one item with same key.
 *
 * ```ts
 * import HashDict from "scl/dict/hash"
 * ```
 *
 * Most methods in this collection, given that a proper hashing function is set
 * up, are in `Θ(1 + n/k)`. If you're out of luck, this characteristic can grow
 * to `O(n)`.
 *
 * When a new entry is added with a key that is already taken, the dictionary
 * will replace the corresponding entry with the new one.
 *
 * ```ts
 * const d = HashDict.empty<number, string>()
 * d.emplace(1, 'foo')
 * assert.strictEqual(d.getValue(1), 'foo')
 * d.emplace(1, 'bar')
 * assert.strictEqual(d.getValue(1), 'bar')
 * ```
 *
 * @typeparam K The type of key of a given entry.
 * @typeparam V The type of value associated with the given key.
 */
export class HashDict<K, V> extends Hash<[K, V], K> implements Dict<K, V> {

  /**
   * Create an empty [[HashDict]], ready to be populated.
   *
   * ```ts
   * const d = HashDict.empty<number, string>()
   * d.add(1, 'one')
   * d.add(2, 'two')
   * ```
   */
  static empty<K, V>(opts: HashDictOptions<K, V> = {}) {
    const valuesEqual = opts.valuesEqual !== undefined ? opts.valuesEqual : equal;
    const keysEqual = opts.keysEqual !== undefined ? opts.keysEqual : equal;
    return new HashDict<K, V>(
        opts.hash !== undefined ? opts.hash : hash
      , keysEqual
      , (a, b) => valuesEqual(a[1], b[1])
      , pair => pair[0]
      , opts.capacity !== undefined ? opts.capacity : undefined
    );
  }

  /**
   * Create a new [[HashDict]] from the given iterable.
   *
   * ```ts
   * const d = HashDict.from<number, string>([
   *   [1, 'one'], 
   *   [2, 'two']
   * ])
   * ```
   */
  static from<K, V>(iterable: Iterable<[K, V]>, opts: HashDictOptions<K, V> = {}) {
    const dict = HashDict.empty<K, V>(opts);
    for (const element of iterable) {
      dict.add(element);
    }
    return dict;
  }

  /**
   * @ignore
   */
  _getConflict(bucket: Bucket<[K, V]>, value: [K, V]) {
    const key = this.getKey(value);
    for (const cursor of bucket.toRange()) {
      if (this.keysEqual(this.getKey(cursor.value), key)) {
        cursor.value = value;
        return cursor; 
      }
    }
    return null;
  }

  emplace(key: K, val: V) {
    return this.add([key, val]);
  }

  getValue(key: K) {
    const match = this.findKey(key);
    if (match === null) {
      throw new Error(`Cannot retrieve value: provided key does not exist.`);
    }
    return match.value[1];
  }

  clone() {
    const cloned = new HashDict<K, V>(
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

export default HashDict;

