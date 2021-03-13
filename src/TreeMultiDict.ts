
import { RBTreeMultiDict } from "./RBTreeMultiDict"

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
 * @see [[HashMultiDict]] for a fast, unordered version of this collection.
 * @see [[TreeDict]] when you need your keys to be unique.
 *
 * @typeparam K The type of key of a given entry.
 * @typeparam V The type of value associated with the given key.
 */
export class TreeMultiDict<K, V> extends RBTreeMultiDict<K, V> {

}

export default TreeMultiDict;
