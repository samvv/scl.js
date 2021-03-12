
import { RBTreeIndex } from "./RBTreeIndex"

export interface TreeIndexOptions<T, K = T> {

  /**
   * An iterable that will be consumed to fill the collection.
   */
  elements?: Iterable<T>;

  /**
   * Compares two keys and returns whether the first key is less than the
   * second.
   *
   * If left unspecified, a default function will be chosen that works on most
   * keys.
   */
  compareKeys?: (a: K, b: K) => boolean;

  /**
   * Exctracts the key part of the element.
   */
  getKey?: (elements: T) => K;


  /**
   * Used for checking two elements with the same key in the collection.
   */
  isEqual?: (a: T, b: T) => boolean;

  /**
   * Set to `false` to prevent an element with the same key for which
   * [[isEqual]] returns true to be added to the collection.
   */
  allowDuplicates?: boolean;

}

/**
 * An [[Index | indexed collection]] that is backed by the recommended
 * implementation that strikes a balance between fast storage and fast
 * retrieval of elements. You may assume that most operations are at least
 * within `O(log(n))` and that all elements are ordered from smallest to
 * largest.
 *
 * ```
 * import { TreeIndex } from "scl";
 *
 * interface Person {
 *   firstName: string
 *   email: string,
 *   age: number,
 * }
 *
 * const personsSortedByAge = new TreeIndex<Person, number>([
 *   {
 *     firstName: 'Jack',
 *     email: 'jack.smith@gmail.com',
 *     age: 34
 *   },
 *   {
 *     firstName: 'Bob',
 *     email: 'thebobman@gmail.com',
 *     age: 17
 *   },
 *   {
 *      firstName: 'Jessie',
 *      email: 'jessie@gmail.com',
 *      age: 25
 *   },
 *   {
 *     firstName: 'Anna',
 *     email: 'anna@outlook.com',
 *     age: 58
 *   }
 * ]);
 *
 * const jack = personsSortedByAge.findKey(34);
 *
 * // The following will return Jessie (aged 25)
 * const oldestPersonYoungerThan30 = personsSortedByAge.lowerKey(30)
 *
 * // This will print names in the following order:
 * // Bob (aged 17)
 * // Jessie (aged 25)
 * // Jack (aged 34)
 * // Anna (aged 58)
 * for (const person of personsSortedByAge) {
 *   console.log(person.fullName);
 * }
 * ```
 *
 * @see AVLTreeIndex
 */
export class TreeIndex<T, K = T> extends RBTreeIndex<T, K> {

  constructor(opts: Iterable<T> | TreeIndexOptions<T, K> = {}) {
    super(opts);
  }

}
