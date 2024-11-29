
import { MultiDictBase } from "./MultiDictBase.js";
import { isEqual, isIterable, ResolveAction } from "./util.js";
import { TreeDictOptions } from "./TreeDict.js";
import { RBTreeIndex } from "./RBTreeIndex.js";

/**
 * A tree-based dictionary that can store multile items with the same key, but
 * only if the values differ.
 *
 * ```ts
 * import { TreeMultiDict } from "scl"
 * ```
 *
 * The following table summarises the worst-case time complexity of the most
 * commonly used properies of this class. For more information, see the
 * documentation of the respective property.
 *
 * | Property name                          | Worst case   |
 * |----------------------------------------|--------------|
 * | {@link TreeDict.add add()}             | `O(log(n))`  |
 * | {@link TreeDict.clear clear()}         | `O(1)`       |
 * | {@link TreeDict.equalKeys equalKeys()} | `O(n)`       |
 * | {@link TreeDict.delete delete()}       | `O(log(n))`  |
 * | {@link TreeDict.deleteAll deleteAll()} | `O(n)`       |
 * | {@link TreeDict.deleteAt deleteAt()}   | `O(log(n))`  |
 * | {@link TreeDict.size size}             | `O(1)`       |
 *
 * When a new entry is added with a key and value that is already taken, the
 * dictionary will replace the corresponding entry with the new one.
 *
 * ```ts
 * const d = new TreeMultiDict<number, string>()
 * d.emplace(1, 'foo') // ok
 * assert.strictEqual(d.getValues(1), 'foo')
 * d.emplace(1, 'bar') // ok
 * d.emplace(1, 'foo') // ok
 * const values = [...d.getValues(1)]
 * assert.lengthOf(values, 3)
 * assert.deepInclude(value, [1, 'foo']) // appears two times
 * assert.deepInclude(value, [1, 'bar'])
 * ```
 *
 * If you need to throw an error when a key is already taken, simply use
 * {@link TreeDict.has has()}.
 *
 * The items in a tree-based dictionary are guaranteed to be sorted on their
 * keys. This is not true for values with the same, which generally appear in
 * the order by which they were inserted.
 *
 * ```ts
 * const d = new TreeMultiDict<number, string>()
 * d.emplace(2, 'two')
 * d.emplace(1, 'one')
 * d.emplace(3, 'three')
 * assert.deepEqual([...d], [[1, 'one'], [2, 'two'], [3, 'three']])
 * ```
 *
 * @see {@link HashMultiDict} for a fast, unordered version of this collection.
 * @see {@link TreeDict} when you need your keys to be unique.
 * @see {@link TreeManyDict} when you want the values to be unique but not the keys.
 *
 * @typeParam K The type of key of a given entry.
 * @typeParam V The type of value associated with the given key.
 */
export class RBTreeMultiDict<K, V> extends MultiDictBase<K, V> {

  /**
   * Construct a new tree-based dictionary.
   *
   * ```ts
   * const d = new TreeMultiDict<number, string>()
   * ```
   *
   * Similar to JavaScript's built-in [map type][1], the constructor accepts a
   * list of key-value pairs that will immediately be added to the resulting
   * dictionary.
   *
   * ```ts
   * const d = new TreeMultiDict<number, string>([
   *   [1, 'one'],
   *   [2, 'two']
   * ])
   * ```
   *
   * The dictionary can be tweaked by providing a {@link TreeDictOptions}-object,
   * which allows to configure things like the default compare function and
   * value equality.
   *
   * ```ts
   * const d = new TreeMultiDict<number, string>({
   *   compare: (a, b) => a < b,
   *   valuesEqual: (a, b) => a === b,
   *   elements: [[1, 'one'], [2, 'two']]
   * })
   * ```
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
   */
  constructor(opts: Iterable<[K, V]> | RBTreeIndex<[K, V], K> | TreeDictOptions<K, V> = {}) {
    if (opts instanceof RBTreeIndex) {
      super(opts);
    } else {
      if (isIterable(opts)) {
        opts = { elements: opts }
      }
      const valuesEqual = opts.valuesEqual ?? isEqual;
      super(
        new RBTreeIndex({
          getKey: pair => pair[0],
          isEqual: (a, b) => valuesEqual(a[1], b[1]),
          onDuplicateKeys: ResolveAction.Insert,
          onDuplicateElements: ResolveAction.Insert,
          ...opts
        })
      );
    }
  }

  public clone() {
    return new RBTreeMultiDict(this.index)
  }

}

export default RBTreeMultiDict;
