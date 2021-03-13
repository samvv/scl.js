
import { BSTreeIndexOptions } from "./BSTreeIndex";
import { RBTreeDict } from "./RBTreeDict";

/**
 * Options passed to a tree-like dictionary to configure its behaviour.
 *
 * @see [[TreeDict]]
 * @see [[TreeMultiDict]]
 */
export interface TreeDictOptions<K, V> extends BSTreeIndexOptions<[K, V], K> {

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
 * import { TreeDict } from "scl"
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
 * @see [[TreeMultiDict]] when you need to store multiple items.
 *
 * @typeparam K The type of key of a given entry.
 * @typeparam V The type of value associated with the given key.
 */
export class TreeDict<K, V> extends RBTreeDict<K, V> {

}

export default TreeDict;
