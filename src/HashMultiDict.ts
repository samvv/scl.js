
import { HashIndex } from "./HashIndex.js";
import { isEqual, isIterable, ResolveAction } from "./util.js";
import { HashDictOptions } from "./HashDict.js";
import { MultiDictBase } from "./MultiDictBase.js";

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
export class HashMultiDict<K, V> extends MultiDictBase<K, V> {

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
   g   elements: [[1, 'one'], [2, 'two']]
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
        new HashIndex({
          onDuplicateKeys: ResolveAction.Insert,
          onDuplicateElements: ResolveAction.Insert,
          elementsEqual: (a, b) => valuesEqual(a[1], b[1]),
          getKey: pair => pair[0],
          ...restOpts,
        })
      );
    }
  }

  public clone() {
    return new HashMultiDict<K, V>(this.index.clone());
  }

}

export default HashMultiDict;
