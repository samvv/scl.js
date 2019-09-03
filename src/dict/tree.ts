
import AVL, { AVLTreeConstructor } from "../avl"
import { lesser, equal } from "../util"

/**
 * Options passed to a tree-like dictionary to configure its behaviour.
 *
 * @see [[TreeDict]]
 * @see [[TreeManyDict]]
 * @see [[TreeMultiDict]]
 */
export interface TreeDictOptions<K, V> {

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
 * | {@link TreeDict.equalKeys equalKeys()} | `O(n)`       |
 * | {@link TreeDict.delete delete()}       | `O(log(n))`  |
 * | {@link TreeDict.deleteAll deleteAll()} | `O(n)`       |
 * | {@link TreeDict.deleteAt deleteAt()}   | `O(log(n))`  |
 * | {@link TreeDict.size size}             | `O(1)`       |
 *
 * When a new entry is added with a key that is already taken, the dictionary
 * will replace the corresponding entry with the new one.
 *
 * ```ts
 * const d = TreeDict.empty<number, string>()
 * d.emplace(1, 'foo')
 * assert.strictEqual(d.getValue(2), 'foo')
 * d.emplace(1, 'bar')
 * assert.strictEqual(d.getValue(2), 'bar')
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

  static empty<K, V>(opts: TreeDictOptions<K, V> = {}) {
    const valuesEqual = opts.valuesEqual !== undefined ? opts.valuesEqual : equal;
    return new TreeDict<K, V>(
      opts.compare !== undefined ? opts.compare : lesser
    , pair => pair[0]
    , (a, b) => valuesEqual(a[1], b[1])
    , false
    );
  }

  static from<K, V>(iterable: Iterable<[K, V]>, opts?: TreeDictOptions<K, V>) {
    // FIXME might be able to optimise this
    const dict = TreeDict.empty(opts);
    for (const element of iterable) {
      dict.add(element);
    }
    return dict;
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
    return new TreeDict<K, V>(
      this.lessThan
    , pair => pair[0]
    , this.elementsEqual
    , false
    )
  }

}

export default TreeDict;

