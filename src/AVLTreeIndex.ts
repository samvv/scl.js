
import { BSNode, BSNodeRange, BST, BSTreeIndexOptions, equalKeysNoStrict } from "./BSTreeIndex";
import { AddResult } from "./interfaces";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cursor } from "./interfaces";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ResolveAction } from "./util";

export class AVLNode<T> extends BSNode<T> {

  constructor(
    value: T,
    parent: AVLNode<T> | null = null,
    public left: AVLNode<T> | null = null,
    public right: AVLNode<T> | null =  null,
    public balance: number = 0
  ) {
    super(parent, value, left, right);
  }

}

export interface AVLTreeIndexOptions<T, K = T> extends BSTreeIndexOptions<T, K> {

}

/**
 * A transparent [[Cursor]] that only works on the right AVL tree.
 */
export type AVLTreeIndexCursor<T> = AVLNode<T>;

/**
 * A tree-like data structure that implements the Adelson-Velsky and Landis
 * algorithm for inserting and deleting nodes. The tree will always be almost
 * completely balanced and is very performant when there are frequent lookups
 * but not as much mutations.
 *
 * You can use trees as an alternative to hashing. Binary search trees have the
 * added bonus that their elements are sorted, so if you add 1, 4, 3, 2 into an
 * AVL tree in that order the elements will be returned as 1, 2, 3, 4.
 *
 * ⚠️ If you don't require the elements to be sorted hashing might be faster.
 *
 * The following table lists the performance characteristics of the most
 * commonly used methods of an AVL tree:
 *
 * | Property name                              | Worst case   |
 * |--------------------------------------------|--------------|
 * | {@link AVLTreeIndex.add add()}             | `O(log(n))`  |
 * | {@link AVLTreeIndex.clear clear()}         | `O(1)`       |
 * | {@link AVLTreeIndex.equalKeys equalKeys()} | `O(log(n))`  |
 * | {@link AVLTreeIndex.delete delete()}       | `O(log(n))`  |
 * | {@link AVLTreeIndex.deleteAll deleteAll()} | `O(log(n))`  |
 * | {@link AVLTreeIndex.deleteAt deleteAt()}   | `O(log(n))`  |
 * | {@link AVLTreeIndex.size size}             | `O(1)`       |
 *
 *
 * ## Examples
 *
 * ### Constructing AVL trees and adding elements
 *
 * You create a new AVL tree by using the `new` keyword. Use [[add]] to insert
 * elements into the tree.
 *
 * ```
 * import { AVLTreeIndex } from "scl";
 *
 * const index = new AVLTreeIndex();
 *
 * index.add(1);
 * index.add(2);
 * index.add(3);
 * ```
 *
 * Alternatively, you can pass any [Iterable][2] as the first argument. So the
 * above is equivalent to the following:
 *
 * ```
 * const index = new AVLTreeIndex([
 *   1,
 *   2,
 *   3,
 * ]);
 * ```
 *
 * ### Choosing the key and determining how to detect duplicates
 *
 * [Deterministic finite automatons][2] are frequently used in computer science
 * to model all kinds of computations. In this example, we store the mapping
 * from one state of the automaton to another. For the sake of this example, we
 * want the transitions to be sorted on the character is accepted. By
 * definition, multiple transitions with the same character are not allowed.
 *
 * ```
 * import { ResolveAction, AVLTreeIndex } from "scl"
 *
 * interface DFAState {
 *   id: string;
 *   isFinal: boolean;
 *   nextStates: AVLTreeIndex<DFAStateTransition, string>;
 * }
 *
 * interface DFAStateTransition {
 *   character: string;
 *   nextState: DFAState;
 * }
 *
 * const nextStates = new AVLTreeIndex<DFAStateTransition, string>({
 *   getKey: transition => transition.character,
 *   compareKeys: (a, b) => a.charCodeAt(0) < b.charCodeAt(0),
 *   isEqual: (a, b) => a.nextState.id === b.nextState.id,
 * });
 *
 * const s1: DFAState = {
 *   id: 1,
 *   isFinal: false,
 *   nextStates,
 * }
 * ```
 *
 * ### Allowing multiple elements with the same key
 *
 * In this example, we index people based on their age. However, many people
 * may have the same age, so we have to allow duplicate keys in order to
 * remedy this. For the sake of the example, we simply ignore people that
 * have already been added.
 *
 * ```
 * interface Person {
 *   firstName: string;
 *   email: string;
 *   age: number;
 * }
 *
 * const index = new AVLTreeIndex({
 *   getKey: person => person.age,
 *   compareKeys: (a, b) => a < b,
 *   onDuplicateKeys: ResolveAction.Insert,
 *   onDuplicateElements: ResolveAction.Ignore,
 * });
 *
 * // OK, will be added to the index
 * index.add({
 *   firstName: 'Bob',
 *   email: 'thebobman@gmail.com',
 *   age: 34,
 * });
 *
 * // OK, will return the existing element
 * const [didAdd, cursor] = index.add({
 *   firstName: 'Bob',
 *   email: 'thebobman@gmail.com',
 *   age: 12,
 * });
 *
 * console.log(`Bob still is ${cursor.value.age}`)
 *
 * // This will print the following result:
 * // - Bob (aged 17)
 * // - Jessie (aged 25)
 * // - Jack (aged 34)
 * // - Anna (aged 58)
 * for (const person of personsSortedByAge) {
 *   console.log(`- ${person.fullName} (aged ${person.age})`);
 * }
 * ```
 *
 * ### Subclassing AVLTreeIndex
 *
 * In the second example, it might become cumbersome to create many of the same
 * type of indices. Therefore, we have made it possible to subclass the AVL
 * tree and initialize it with your own configuration each time a new tree is
 * constructed.
 *
 * ```
 * import { isIterable, AVLTreeIndexOptions, AVLTreeIndex } from "scl";
 *
 * class DFATransitionMap extends AVLTreeIndex<DFAStateTransition, string> {
 *
 *   constructor(opts: Iterable<DFAStateTransition> | AVLTreeIndexOptions<DFAStateTransition, string>) {
 *
 *     // We want to be able to pass in just a simple Iterable object, so we
 *     // need to add some extra logic
 *     if (isIterable(opts)) {
 *       opts = { elements: opts }
 *     }
 *
 *     // Initialize our AVLTreeIndex with user-provided options and override
 *     // some options specific to DFATransitionMap
 *     super({
 *       ...opts,
 *       getKey: transition => transition.character,
 *       compareKeys: (a, b) => a.charCodeAt(0) < b.charCodeAt(0),
 *       isEqual: (a, b) => a.nextState.id === b.nextState.id,
 *     });
 *
 *   }
 *
 * }
 *
 * const nextStates = new DFATransitionMap([
 *   { character: 'a', nextState: s2 }
 * ]);
 * ```
 *
 * [1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol
 * [2]: https://en.wikipedia.org/wiki/Deterministic_finite_automaton
 *
 * @typeparam T The type of element that will be stored
 * @typeparam K The type of key used to index
 */
export class AVLTreeIndex<T, K = T> extends BST<T, K> {

  /**
   * Construct a new AVL tree index by providing a list of elements that should
   * be stored inside the index or a more complex object detailing e.g. how the
   * keys of the elements should be extracted and how to comare individual
   * elements.
   *
   * See the examples [[AVLTreeIndex | on the top of this page]] for more
   * information on how to construct a new index of this type.
   *
   * @see [[AVLTreeIndexOptions]]
   */
  constructor(opts: Iterable<T> | AVLTreeIndexOptions<T, K> = {}) {
    super(opts, value => new AVLNode(value));
  }

  protected rotateLeft(node: AVLNode<T>): AVLNode<T> {
    const right = node.right!;
    if (right.balance === 0) {
      node.balance  = +1;
      right.balance = -1;
    } else {
      node.balance = 0;
      right.balance = 0;
    }
    return super.rotateLeft(node) as AVLNode<T>;
  }

  protected rotateRight(node: AVLNode<T>): AVLNode<T> {
    const left = node.left!;
    if (left.balance === 0) {
      node.balance = -1;
      left.balance = +1;
    } else {
      left.balance = 0;
      node.balance = 0;
    }
    return super.rotateRight(node) as AVLNode<T>;
  }

  protected rotateRightThenLeft(X: AVLNode<T>): AVLNode<T> {
    const Z = X.right!;
    const Y = Z.left!;
    const t2 = Y.left;
    const t3 = Y.right;
    Z.left = t3;
    if (t3 !== null) {
      t3.parent = Z;
    }
    Y.right = Z;
    Z.parent = Y;
    X.right = t2;
    if (t2 !== null) {
      t2.parent = X;
    }
    if (X === this.root) {
      this.root = Y;
    } else {
      const parent = X.parent!;
      if (X === parent.left) {
        parent.left = Y;
      } else {
        parent.right = Y;
      }
    }
    Y.left = X;
    Y.parent = X.parent;
    X.parent = Y;
    if (Y.balance === 0) {
      X.balance = 0;
      Z.balance = 0;
    } else if (Y.balance > 0) {
      X.balance = -1;
      Z.balance = 0;
    } else {
      X.balance = 0;
      Z.balance = +1;
    }
    Y.balance = 0;
    return Y;
  }

  protected rotateLeftThenRight(node: AVLNode<T>): AVLNode<T> { 
    const X = node;
    const Z = node.left!;
    const Y = Z.right!;
    const t2 = Y.left;
    const t3 = Y.right;
    Z.right = t2;
    if (t2 !== null) {
      t2.parent = Z;
    }
    Y.left =  Z;
    Z.parent = Y;
    X.left = t3;
    if (t3 !== null) {
      t3.parent = X;
    }
    if (X === this.root) {
      this.root = Y;
    } else {
      const parent = X.parent!;
      if (X === parent.left) {
        parent.left = Y;
      } else {
        parent.right = Y;
      }
    }
    Y.right = X;
    Y.parent = X.parent;
    X.parent = Y;
    if (Y.balance === 0) {
      X.balance = 0;
      Z.balance = 0;
    } else if (Y.balance < 0) {
      X.balance = +1;
      Z.balance = 0;
    } else {
      X.balance = 0;
      Z.balance = -1;
    }
    Y.balance = 0;
    return Y;
  }

  /**
   * Find the element whose key is at most equal to the given key. If no key is
   * equal to the requested key, the element with a key just slighly lower than
   * the requested key is returned.
   *
   * ```
   * const jack = personsSortedByAge.findKey(34);
   *
   * // The following will return Jessie (aged 25)
   * const oldestPersonYoungerThan30 = personsSortedByAge.lowerKey(30)
   * ```
   */
  public getLeastUpperBound(key: K): AVLTreeIndexCursor<T> | null {
    return super.getLeastUpperBound(key) as AVLTreeIndexCursor<T> | null;
  }

  /**
   * Add a new element to the index. Whether the element is ignored, replaced or
   * whether an error is thrown depends on the value passed to
   * [[onDuplicateKeys]] and [[onDuplicateElements]].
   *
   * This operation takes `O(log(n))` time.
   *
   * The function will first attempt to apply [[onDuplicateElements]] and if
   * that didn't do anything special it will continue with [[onDuplicateKeys]].
   *
   * The return value of the function depends on whether `element` was added,
   * ignored or replaced:
   *
   *  - The element was added to the index. The method returns `true` with a
   *    cursor pointing to the newly added element.
   *  - The element was replaced. The method returns `true` with a cursor
   *    pointing to the location where the element was replaced.
   *  - The element was ignored. The method returns `false` with a cursor
   *    pointing to the location of the element in the index that forced this
   *    element to be ignored.
   *
   * @param hint A transparent object obtained with [[AVLTreeIndex.getAddHint]]
   *             that can speed up the insertion process.
   *
   * @see [[AddResult]]
   * @see [[delete]]
   */
  public add(element: T, hint?: unknown): AddResult<T> {

    const [didInsert, insertedNode] = super.add(element, hint) as [boolean, AVLNode<T>];

    if (!didInsert) {
      return [false, insertedNode];
    }

    if (this.root === insertedNode) {
      return [true, this.root];
    }

    let node: AVLNode<T> = insertedNode;

    for (
      let parent: AVLNode<T> | null = node.parent as AVLNode<T>;
      parent !== null;
      parent = node.parent as AVLNode<T> | null
    ) {

      if (node === parent.right) {

        if (parent.balance > 0) {

          if (node.balance < 0) {
            this.rotateRightThenLeft(parent);
          } else { 
            this.rotateLeft(parent);
          }

        } else {

          // If `parent` contained more nodes on the other side of where we
          // inserted, then the tree accidentally became balanced when the user
          // inserted the element. There is no more work to do.
          if (parent.balance < 0) {
            parent.balance = 0;
            break;
          }

          parent.balance = +1;
          node = parent;
          continue;
        }

      } else {

        if (parent.balance < 0) {

          if (node.balance > 0) {
            this.rotateLeftThenRight(parent)
          } else {
            this.rotateRight(parent);
          }

        } else {

          // If `parent` contained more nodes on the other side of where we
          // inserted, then the tree accidentally became balanced when the user
          // inserted the element. There is no more work to do.
          if (parent.balance > 0) {
            parent.balance = 0;
            break;
          }

          parent.balance = -1;
          node = parent;
          continue;
        }

      }

      break;

    }

    return [true, insertedNode];
  }

  /**
   * Get a range of elements that contain the given key. The range may be empty
   * if no elements with the requested key were found.
   *
   * ```
   * const aged32 = personsSortedByAge.equalKeys(32);
   *
   * // There are no people who are exactly 32 years old
   * assert(aged32.size === 0);
   *
   * for (const person of personsSortedByAge.equalKeys(17)) {
   *   console.log(`${person.firstName} is 17 years old.`);
   * }
   *
   * ```
   *
   * @param key The key that should be searched for
   * @returns A range of elements that contain the given key
   */
  public equalKeys(key: K): BSNodeRange<T> {
    return equalKeysNoStrict(this, key);
  }

  /**
   * Delete an element from the tree by providing its location in the tree with
   * an [[AVLTreeIndexCursor]].
   *
   * This method takes `O(log(n))` time. It is slightly faster than deleting
   * the element by key due to the fact that a search for the node has already
   * been done.
   */
  public deleteAt(node: AVLTreeIndexCursor<T>): void {

    this.elementCount--;

    while (true) {
      const parent = node.parent as AVLNode<T> | null;
      if (node.left === null && node.right === null) {
        this.retrace(node);
        if (parent === null) {
          this.root = null;
        } else {
          if (node === parent.left) {
            parent.left = null;
          } else {
            parent.right = null;
          }
        }
        break;
      } else if (node.left === null || node.right === null) {
        const replacement = (node.left !== null ? node.left : node.right) as AVLNode<T>;
        replacement.parent = parent;
        if (parent === null) {
          this.root = replacement;
        } else {
          if (node === parent.left) {
            parent.left = replacement;
          } else {
            parent.right = replacement;
          }
          this.retrace(replacement);
        }
        break;
      } else {
        const replacement = node.right.getLeftmost() as AVLNode<T>;
        this.swapValues(node, replacement);
        node = replacement;
      }
    }

  }


  private retrace(N: AVLNode<T>) {

    for (
      let X = N.parent as AVLNode<T> | null;
      X !== null;
      X = N.parent as AVLNode<T> | null
    ) {

      if (N === X.left) {

        if (X.balance > 0) {
          const Z = X.right!;
          const oldBalance = Z.balance;
          if (Z.balance < 0) {
            N = this.rotateRightThenLeft(X);
          } else {
            N = this.rotateLeft(X);
          }
          if (oldBalance === 0) {
            break;
          }
        } else {
          if (X.balance === 0) {
            X.balance = +1;
            break;
          }
          N = X;
          N.balance = 0;
          continue;
        }

      } else {

        if (X.balance < 0) {
          const Z = X.left!;
          const oldBalance = Z.balance;
          if (Z.balance > 0) {
            N = this.rotateLeftThenRight(X);
          } else {
            N = this.rotateRight(X);
          }
          if (oldBalance === 0) {
            break;
          }
        } else {
          if (X.balance === 0) {
            X.balance = -1;
            break;
          }
          N = X;
          N.balance = 0;
          continue;
        }

      }

    }

  }

  /**
   * Make a shallow copy of this tree so that the new tree contains the exact
   * same elements but inserting and removing elements will not change the
   * original tree.
   *
   * ```
   * import { AVLTreeIndex } from "scl";
   *
   * const index = new AVLTreeIndex<number>([1, 2, 3]);
   *
   * const cloned = index.clone();
   *
   * cloned.delete(2);
   *
   * assert(cloned.size === 2);
   *
   * assert(index.size === 3);
   * ```
   *
   * This method currently takes `O(n.log(n))` time.
   */
  public clone() {
    return new AVLTreeIndex<T, K>({
      compareKeys: this.isKeyLessThan
    , getKey: this.getKey
    , isEqual: this.isEqual
    , onDuplicateKeys: this.duplicateKeys
    , onDuplicateElements: this.duplicateElements
    , elements: this
    });
  }

}

export default AVLTreeIndex;

