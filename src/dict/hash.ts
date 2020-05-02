
import { Bucket, Hash } from "../hash";
import { Dict } from "../interfaces";
import { equal, hash, isIterable } from "../util";

/**
 * Options passed to a hash-like dictionary in order to configure its behaviour.
 *
 * The following example demonstrates a dictionary with a capacity of 1024 and
 * a hashing function that simply returns the integer itself.
 *
 * ```ts
 * const d = new HashDict<number, string>({
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
   * An iterable that will be consumed to fill the dictionary.
   */
  elements?: Iterable<[K, V]>;

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
 * const d = new HashDict<number, string>()
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

  protected valuesEqual: (a: V, b: V) => boolean;

  /**
   * Construct a new hash-based dictionary.
   *
   * ```ts
   * const d = new HashDict<number, string>()
   * ```
   *
   * Similar to JavaScript's built-in [map type][1], the constructor accepts a
   * list of key-value pairs that will immediately be added to the resulting
   * dictionary.
   *
   * ```ts
   * const d = new HashDict<number, string>([
   *   [1, 'one'],
   *   [2, 'two']
   * ])
   * ```
   *
   * The dictionary can be tweaked by providing a [[HashDictOptions]]-object,
   * which allows to configure things like the default hashing function and
   * value equality.
   *
   * ```ts
   * const d = new HashDict<number, string>({
   *   hash: num => num,
   *   keysEqual: (a, b) => a === b,
   *   valuesEqual: (a, b) => a === b,
   *   elements: [[1, 'one'], [2, 'two']]
   * })
   * ```
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
   */
  constructor(opts: Iterable<[K, V]> | HashDictOptions<K, V> = {}) {
    if (isIterable(opts)) {
      super(hash, equal, (a, b) => equal(a[1], b[1]), (pair) => pair[0]);
      for (const element of opts) {
        this.add(element);
      }
      this.valuesEqual = equal;
    } else {
      const valuesEqual = opts.valuesEqual !== undefined ? opts.valuesEqual : equal;
      const keysEqual = opts.keysEqual !== undefined ? opts.keysEqual : equal;
      super(
          opts.hash !== undefined ? opts.hash : hash
        , keysEqual
        , (a, b) => valuesEqual(a[1], b[1])
        , (pair) => pair[0]
        , opts.capacity !== undefined ? opts.capacity : undefined,
      );
      if (opts.elements !== undefined) {
        for (const element of opts.elements) {
          this.add(element);
        }
      }
      this.valuesEqual = valuesEqual;
    }
  }

  /**
   * @ignore
   */
  public _getConflict(bucket: Bucket<[K, V]>, value: [K, V]) {
    const key = this.getKey(value);
    for (const cursor of bucket.toRange().cursors()) {
      if (this.keysEqual(this.getKey(cursor.value), key)) {
        cursor.value = value;
        return cursor;
      }
    }
    return null;
  }

  public emplace(key: K, val: V) {
    return this.add([key, val]);
  }

  public getValue(key: K) {
    const match = this.findKey(key);
    if (match === null) {
      throw new Error(`Cannot retrieve value: provided key does not exist.`);
    }
    return match.value[1];
  }

  public clone() {
    return new HashDict<K, V>({
        hash: this.getHash
      , keysEqual: this.keysEqual
      , valuesEqual: this.valuesEqual
      , capacity: this._array.length
      , elements: this,
    });
  }

}

export default HashDict;
