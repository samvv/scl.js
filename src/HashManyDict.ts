
import { Bucket, Hash, HashCursor } from "./Hash";
import { MultiDict } from "./interfaces";
import { isEqual, hash, isIterable } from "./util";
import { HashDictOptions } from "./HashDict";

/**
 * A hash-based dictionary that can store multile items with the same key, but
 * only if the values differ.
 *
 * ```ts
 * import { HashManyDict } from "scl"
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
 * const d = new HashManyDict<number, string>()
 * d.emplace(1, 'foo') // ok
 * d.emplace(1, 'bar') // ok
 * d.emplace(1, 'foo') // ok; replaced
 * const values = [...d.getValues(1)]
 * assert.lengthOf(values, 2)
 * assert.deepInclude(value, [1, 'foo'])
 * assert.deepInclude(value, [1, 'bar'])
 * ```
 *
 * @typeparam K The type of key of a given entry.
 * @typeparam V The type of value associated with the given key.
 */
export class HashManyDict<K, V> extends Hash<[K, V], K> implements MultiDict<K, V> {

  protected valuesEqual: (a: V, b: V) => boolean;

  /**
   * Construct a new hash-based dictionary.
   *
   * ```ts
   * const d = new HashManyDict<number, string>()
   * ```
   *
   * Similar to JavaScript's built-in [map type][1], the constructor accepts a
   * list of key-value pairs that will immediately be added to the resulting
   * dictionary.
   *
   * ```ts
   * const d = new HashManyDict<number, string>([
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
   * const d = new HashManyDict<number, string>({
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
      super(hash, isEqual, (a, b) => isEqual(a[1], b[1]), (pair) => pair[0]);
      for (const element of opts) {
        this.add(element);
      }
      this.valuesEqual = isEqual;
    } else {
      const valuesEqual = opts.valuesEqual !== undefined ? opts.valuesEqual : isEqual;
      const keysEqual = opts.keysEqual !== undefined ? opts.keysEqual : isEqual;
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

  public _getConflict(bucket: Bucket<[K, V]>, val: [K, V]) {
    for (const cursor of bucket.toRange().cursors()) {
      if (this.elementsEqual(cursor.value, val)) {
        return cursor;
      }
    }
    return null;
  }

  public emplace(key: K, val: V) {
    return this.add([key, val]);
  }

  public *getValues(key: K): IterableIterator<V> {
    for (const value of this.equalKeys(key)) {
      yield value[1];
    }
  }

  public add(value: [K, V]): [boolean, HashCursor<[K, V]>] {
    const [added, cursor] = super.add(value);
    if (added === false) {
      cursor.value = value;
    }
    return [added, cursor];
  }

  public clone() {
    return new HashManyDict<K, V>({
        hash: this.getHash
      , keysEqual: this.keysEqual
      , valuesEqual: this.valuesEqual
      , capacity: this._array.length
      , elements: this,
    });
  }

}

export default HashManyDict;
