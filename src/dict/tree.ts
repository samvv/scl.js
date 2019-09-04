
import AVL, { AVLTreeConstructor } from "../avl"
import { lesser, equal, isIterable } from "../util"

/**
 * Options passed to a tree-like dictionary to configure its behaviour.
 *
 * @see [[TreeDict]]
 * @see [[TreeManyDict]]
 * @see [[TreeMultiDict]]
 */
export interface TreeDictOptions<K, V> {

  /**
   * An iterable that will be consumed to fill the dictionary.
   */
  elements?: Iterable<[K, V]>;

  /**
   * Compares two keys and returns whether the first key is less than the second.
   *
   * If left unspecified, a default function will be chosen that works on most
   * keys.
   */
  compare?: (a: K, b: K) => boolean;

  /**
   * Compares two values in the dictionary and returns whether the values are
   * the same.
   *
   * Depending on the dictionary, when this function returns `true`, the entry
   * in the dictionary might be replaced with the second argument.
   *
   * If left unspecified, a default function will be chosen that works on most
   * values.
   */
  valuesEqual?: (a: V, b: V) => boolean;

}

/**
 * A tree-based dictionary that only allows one item with the same key.
 * 
 * ```ts
 * import TreeDict from "scl/dict/tree"
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
 * | {@link TreeDict.equalKeys equalKeys()} | `O(log(n))`  |
 * | {@link TreeDict.delete delete()}       | `O(log(n))`  |
 * | {@link TreeDict.deleteAll deleteAll()} | `O(log(n))`  |
 * | {@link TreeDict.deleteAt deleteAt()}   | `O(log(n))`  |
 * | {@link TreeDict.size size}             | `O(1)`       |
 *
 * When a new entry is added with a key that is already taken, the dictionary
 * will replace the corresponding entry with the new one.
 *
 * ```ts
 * const d = new TreeDict<number, string>()
 * d.emplace(1, 'foo') // ok
 * assert.strictEqual(d.getValue(1), 'foo')
 * d.emplace(1, 'bar') // ok; replaced
 * assert.strictEqual(d.getValue(1), 'bar')
 * ```
 *
 * If you need to throw an error when a key is already taken, simply use
 * {@link TreeDict.has has()}.
 *
 * The items in a tree-based dictionary are guaranteed to be sorted on their
 * keys.
 *
 * ```ts
 * d.emplace(2, 'two')
 * d.emplace(1, 'one')
 * d.emplace(3, 'three')
 * assert.deepEqual([...d], [[1, 'one'], [2, 'two'], [3, 'three']])
 * ```
 *
 * @see [[HashDict]] for a fast, unordered version of this collection.
 * @see [[TreeManyDict]] when you need to store multiple items with the same key but still want uniqueness.
 * @see [[TreeMultiDict]] when you need to store multiple items.
 *
 * @typeparam K The type of key of a given entry.
 * @typeparam V The type of value associated with the given key.
 */
export class TreeDict<K, V> extends AVL<[K, V], K> {

  protected valuesEqual: (a: V, b: V) => boolean;

  /**
   * Construct a new tree-based dictionary.
   *
   * ```ts
   * const d = new TreeDict<number, string>()
   * ```
   *
   * Similar to JavaScript's built-in [map type][1], the constructor accepts a
   * list of key-value pairs that will immediately be added to the resulting
   * dictionary.
   *
   * ```ts
   * const d = new TreeDict<number, string>([
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
   * const d = new TreeDict<number, string>({
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
      super(lesser, pair => pair[0], (a, b) => equal(a[1], b[1]), false);
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
      , false
      );
      this.valuesEqual = valuesEqual;
    }
  }

  emplace(key: K, val: V) {
    return this.add([key, val]);
  }

  add(p: [K, V]) {
    const hint = this.getAddHint(p);
    if (hint[0] === false) {
      hint[1]!.value = p;
    }
    return super.add(p, hint);
  }

  getValue(key: K) {
    const match = this.findKey(key);
    if (match === null) {
      throw new Error(`Cannot retrieve value: provided key does not exist.`);
    }
    return match.value[1];
  }

  clone() {
    return new TreeDict<K, V>({
      compare: this.lessThan
    , valuesEqual: this.valuesEqual
    , elements: this
    })
  }

}

export default TreeDict;

