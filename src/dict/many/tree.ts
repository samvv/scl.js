
// import MultiTreeDict from "../multi/tree"
import AVL from "../../avl"
import { Cursor } from "../../interfaces"
import { lesser, equal, isIterable } from "../../util"
import { MultiDict } from "../../interfaces"
import { TreeDictOptions } from "../tree"

/**
 * A tree-based dictionary that can store multile items with the same key, but
 * only if the values differ.
 * 
 * ```ts
 * import TreeManyDict from "scl/dict/many/tree"
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
 * const d = new TreeManyDict<number, string>()
 * d.emplace(1, 'foo') // ok
 * assert.strictEqual(d.getValues(1), 'foo')
 * d.emplace(1, 'bar') // ok
 * d.emplace(1, 'foo') // ok; replaced
 * const values = [...d.getValues(1)]
 * assert.lengthOf(values, 2)
 * assert.deepInclude(value, [1, 'foo'])
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
 * const d = new TreeManyDict<number, string>()
 * d.emplace(2, 'two')
 * d.emplace(1, 'one')
 * d.emplace(3, 'three')
 * assert.deepEqual([...d], [[1, 'one'], [2, 'two'], [3, 'three']])
 * ```
 *
 * @see [[HashManyDict]] for a fast, unordered version of this collection.
 * @see [[TreeDict]] when you want your keys to be unique.
 * @see [[TreeMultiDict]] when you need to store multiple items.
 *
 * @typeparam K The type of key of a given entry.
 * @typeparam V The type of value associated with the given key.
 */
export class TreeManyDict<K, V> extends AVL<[K, V], K> implements MultiDict<K, V> {

  protected valuesEqual: (a: V, b: V) => boolean;

  /**
   * Construct a new tree-based dictionary.
   *
   * ```ts
   * const d = new TreeManyDict<number, string>()
   * ```
   *
   * Similar to JavaScript's built-in [map type][1], the constructor accepts a
   * list of key-value pairs that will immediately be added to the resulting
   * dictionary.
   *
   * ```ts
   * const d = new TreeManyDict<number, string>([
   *   [1, 'one'],
   *   [2, 'two']
   * ])
   * ```
   *
   * The dictionary can be tweaked by providing a [[TreeDictOptions]]-object,
   * which allows to configure things like the default compare function and
   * value equality.
   *
   * ```ts
   * const d = new TreeManyDict<number, string>({
   *   compare: (a, b) => a < b,
   *   valuesEqual: (a, b) => a === b,
   *   elements: [[1, 'one'], [2, 'two']]
   * })
   * ```
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
   */
  constructor(opts: Iterable<[K, V]> | TreeDictOptions<K, V> = {}) {
    if (isIterable(opts)) {
      super(lesser, pair => pair[0], (a, b) => equal(a[1], b[1]), true);
      for (const element of opts) {
        this.add(element);
      }
      this.valuesEqual = equal;
    } else {
      const valuesEqual = opts.valuesEqual !== undefined ? opts.valuesEqual : equal;
      super(
        opts.compare !== undefined ? opts.compare : lesser
      , pair => pair[0]
      , (a, b) => valuesEqual(a[1], b[1])
      , true
      );
      this.valuesEqual = valuesEqual;
    }
  }

  add(pair: [K, V]): [boolean, Cursor<[K, V]>] {
    for (const node of this.equalKeys(pair[0]).cursors()) {
      if (this.elementsEqual(pair, node.value)) {
        node.value = pair;
        return [false, node];
      }
    }
    return super.add(pair) as [boolean, Cursor<[K, V]>];
  }

  *getValues(key: K) {
    for (const value of this.equalKeys(key)) {
      yield value[1];
    }
  }

  emplace(key: K, val: V) {
    return this.add([key, val]);
  }

  clone() {
    return new TreeManyDict<K, V>({
      compare: this.lessThan
    , valuesEqual: this.valuesEqual
    , elements: this
    })
  }

}

export default TreeManyDict;
