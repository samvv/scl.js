
import { DictBase } from "./DictBase.js";
import { HashIndex, HashIndexOptions } from "./HashIndex.js";
import { isEqual, isIterable, ResolveAction } from "./util.js";

/**
 * Options passed to a hash-like dictionary in order to configure its behaviour.
 *
 * The following example demonstrates a dictionary with a capacity of 1024 and
 * a hashing function that simply returns the integer itself.
 *
 * ```ts
 * import { hash as xxh } from "xxhash"
 * 
 * const d = new HashDict<number, string>({
 *   capacity: 1024,
 *   getHash: key => xxh(key),
 *   keysEqual: key => key === key,
 *   valuesEqual: value => value === value
 * })
 * ```
 *
 * @see {@link HashDict}
 * @see {@link HashMultiDict}
 */
export interface HashDictOptions<K, V> extends HashIndexOptions<[K, V], K> {

  /**
   * A predicate determining when two elements are equal.
   *
   * This function is only called after is has been determined that the keys
   * are equal, so you may safely skip the equality check for the keys.
   *
   * If omitted, the {@link equal | built-in equality function} will be used.
   */
  valuesEqual?: (a: V, b: V) => boolean;

}

/**
 * A simple hash-based dictionary that only allows one item with same key.
 *
 * ```ts
 * import { HashDict } from "scl"
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
 * @typeParam K The type of key of a given entry.
 * @typeParam V The type of value associated with the given key.
 */
export class HashDict<K, V> extends DictBase<K, V> {

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
   * The dictionary can be tweaked by providing a {@link HashDictOptions} object,
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
  constructor(opts: Iterable<[K, V]> | HashIndex<[K, V], K> | HashDictOptions<K, V> = {}) {
    if (opts instanceof HashIndex) {
      super(opts);
    } else {
      if (isIterable(opts)) {
        opts = { elements: opts };
      }
      const {
        valuesEqual = isEqual,
        ...restOpts
      } = opts;
      super(
        new HashIndex<[K, V], K>({
          elementsEqual: (a, b) => valuesEqual(a[1], b[1]),
          onDuplicateElements: ResolveAction.Error,
          onDuplicateKeys: ResolveAction.Error,
          ...restOpts,
        })
      );
    }
  }

  public clone(): HashDict<K, V> {
    return new HashDict<K, V>(this.index.clone());
  }

}

export default HashDict;
