
import { Bucket, Hash } from "./Hash";
import { equal, hash, isIterable } from "./util";
import { HashDictOptions } from "./HashDict";

/**
 * A hash-based dictionary that can store multiple items with the same key.
 *
 * ```ts
 * import { HashMultiDict } from "scl"
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
 * const d = new HashMultiDict<number, string>()
 * d.emplace(1, 'foo') // ok
 * assert.strictEqual(d.getValue(1), 'foo')
 * d.emplace(1, 'bar') // ok
 * d.emplace(1, 'foo') // ok
 * const values = [...d.getValues(1)]
 * assert.strictEqual(values.length, 3)
 * ```
 */
export class HashMultiDict<K, V> extends Hash<[K, V], K> {

  protected valuesEqual: (a: V, b: V) => boolean;

  /**
   * Construct a new hash-based dictionary.
   *
   * ```ts
   * const d = new HashMultiDict<number, string>()
   * ```
   *
   * Similar to JavaScript's built-in [map type][1], the constructor accepts a
   * list of key-value pairs that will immediately be added to the resulting
   * dictionary.
   *
   * ```ts
   * const d = new HashMultiDict<number, string>([
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
   * const d = new HashMultiDict<number, string>({
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
      for  (const element of opts) {
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
      , opts.capacity,
      );
      if (opts.elements !== undefined) {
        for  (const element of opts.elements) {
          this.add(element);
        }
      }
      this.valuesEqual = valuesEqual;
    }
  }

  public emplace(key: K, val: V) {
    return this.add([key, val]);
  }

  public *getValues(key: K) {
    for (const value of this.equalKeys(key)) {
      yield value[1];
    }
  }

  public clone() {
    return new HashMultiDict<K, V>({
        hash: this.getHash
      , keysEqual: this.keysEqual
      , valuesEqual: this.valuesEqual
      , capacity: this._array.length
      , elements: this,
    });
  }

  protected _getConflict(bucket: Bucket<[K, V]>, element: [K, V]) {
    return null;
  }

}

export default HashMultiDict;
