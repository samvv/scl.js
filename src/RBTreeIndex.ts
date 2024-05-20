import { AddResult, Index } from "./interfaces.js";
import { BST, BSNode, BSTreeIndexOptions, equalKeysNoStrict, BSNodeRange } from "./BSTreeIndex.js"

export const enum RBColor {
  Red,
  Black,
}

export class RBNode<T> extends BSNode<T> {

  constructor(
    parentNode: RBNode<T> | undefined,
    value: T,
    left: RBNode<T> | undefined = undefined,
    right: RBNode<T> | undefined = undefined,
    public color: RBColor = RBColor.Red,
  ) {
    super(parentNode, value, left, right);
  }

}


export interface RBTreeIndexOptions<T, K = T> extends BSTreeIndexOptions<T, K> {

}

/**
 * A transparent {@link Cursor} that only works on the right RB tree.
 */
export type RBTreeIndexCursor<T> = RBNode<T>;

/**
 * A tree-like data structure that uses node coloring and a few specific rules
 * to provide fast insertion, deletion and lookup of nodes.
 *
 * You can use trees as an alternative to hashing. Binary search trees have the
 * added bonus that their elements are sorted, so if you add 1, 4, 3, 2 into an
 * red-black tree in that order the elements will be returned as 1, 2, 3, 4.
 *
 * ⚠️ If you don't require the elements to be sorted hashing might be faster.
 *
 * The following table lists the performance characteristics of the most
 * commonly used methods of a Red/Black tree:
 *
 * | Property name                              | Worst case   |
 * |--------------------------------------------|--------------|
 * | {@link RBTreeIndex.add add()}             | `O(log(n))`  |
 * | {@link RBTreeIndex.clear clear()}         | `O(1)`       |
 * | {@link RBTreeIndex.equalKeys equalKeys()} | `O(log(n))`  |
 * | {@link RBTreeIndex.delete delete()}       | `O(log(n))`  |
 * | {@link RBTreeIndex.deleteAll deleteAll()} | `O(log(n))`  |
 * | {@link RBTreeIndex.deleteAt deleteAt()}   | `O(log(n))`  |
 * | {@link RBTreeIndex.size size}             | `O(1)`       |
 *
 *
 * ## Examples
 *
 * ### Constructing red-black trees and adding elements
 *
 * You create a new red-black tree by using the `new` keyword. Use {@link add} to insert
 * elements into the tree.
 *
 * ```
 * import { RBTreeIndex } from "scl";
 *
 * const index = new RBTreeIndex();
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
 * const index = new RBTreeIndex([
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
 * import { ResolveAction, RBTreeIndex } from "scl"
 *
 * interface DFAState {
 *   id: string;
 *   isFinal: boolean;
 *   nextStates: RBTreeIndex<DFAStateTransition, string>;
 * }
 *
 * interface DFAStateTransition {
 *   character: string;
 *   nextState: DFAState;
 * }
 *
 * const nextStates = new RBTreeIndex<DFAStateTransition, string>({
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
 * const index = new RBTreeIndex({
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
 * ### Subclassing RBTreeIndex
 *
 * In the second example, it might become cumbersome to create many of the same
 * type of indices. Therefore, we have made it possible to subclass the red-black
 * tree and initialize it with your own configuration each time a new tree is
 * constructed.
 *
 * ```
 * import { isIterable, RBTreeIndexOptions, RBTreeIndex } from "scl";
 *
 * class DFATransitionMap extends RBTreeIndex<DFAStateTransition, string> {
 *
 *   constructor(opts: Iterable<DFAStateTransition> | RBTreeIndexOptions<DFAStateTransition, string>) {
 *
 *     // We want to be able to pass in just a simple Iterable object, so we
 *     // need to add some extra logic
 *     if (isIterable(opts)) {
 *       opts = { elements: opts }
 *     }
 *
 *     // Initialize our RBTreeIndex with user-provided options and override
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
export class RBTreeIndex<T, K = T> extends BST<T, K> implements Index<T, K> {

  /**
   * Construct a new red-black tree index by providing a list of elements that should
   * be stored inside the index or a more complex object detailing e.g. how the
   * keys of the elements should be extracted and how to comare individual
   * elements.
   *
   * See the examples {@link RBTreeIndex | on the top of this page} for more
   * information on how to construct a new index of this type.
   *
   * @see {@link RBTreeIndexOptions}
   */
  constructor(opts: Iterable<T> | RBTreeIndexOptions<T, K> = {}) {
    super(opts, value => new RBNode<T>(undefined, value));
  }

  /**
   * Add a new element to the index. Whether the element is ignored, replaced or
   * whether an error is thrown depends on the value passed to
   * {@link onDuplicateKeys} and {@link onDuplicateElements}.
   *
   * This operation takes `O(log(n))` time.
   *
   * The function will first attempt to apply {@link onDuplicateElements} and if
   * that didn't do anything special it will continue with {@link onDuplicateKeys}.
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
   * @param hint A transparent object obtained with {@link RBTreeIndex.getAddHint}
   *             that can speed up the insertion process.
   *
   * @see {@link AddResult}
   * @see {@link delete}
   */
  public add(element: T, hint?: unknown): AddResult<T> {

    const [didInsert, node] = super.add(element, hint) as [boolean, RBNode<T>];

    if (!didInsert) {
      return [false, node];
    }

    this.fixRedRed(node);

    return [true, node];
  }

  private fixRedRed(node: RBNode<T>): void {

    // We only have to loop for as long as there is a parent node that shares
    // the same red color with the child node being visited.
    while (node !== this.root
        && node.color === RBColor.Red) {

      // We know the parentNode must exist because `node` wasn't the root node.
      const parent = node.parent as RBNode<T>;

      // This should be an invariant of the while-loop but awesome TypeScript
      // forces us to cast the parent node first.
      if (parent.color !== RBColor.Red) {
        break;
      }

      // We know the parent node's parent node must exist because the parent
      // node was red and the root node can never be red.
      const grandParent = parent.parent as RBNode<T>;

      // The uncle is the node next to `parent` and shares the same
      // `grandParent` with it.
      const uncle = node.getUncle() as RBNode<T> | undefined;

      // The following is a simple case where we just invert the colors of
      // parent, grandParent and uncle so that the only node that needs
      // checking is `grandParent`.
      if (uncle !== undefined && uncle.color === RBColor.Red) {
        uncle.color = RBColor.Black;
        parent.color = RBColor.Black;
        grandParent.color = RBColor.Red;
        node = grandParent;
        continue;
      }

      // The following logic covers LL, LR, RL and RR rotation cases. In each
      // case, the tree is again in a 'fixed' state so the loop terminates
      // right after it.

      if (grandParent.left === parent) {

        if (node === parent.right) {

          // The uncle is stored in grandParent.right. After this iteration, we
          // should have performed a left rotation followed by a right rotation.
          // The first rotation is done here, while the second rotation is
          // shared with the LL case.
          this.rotateLeft(parent);

          // `node` will be our new grandparent, so we pick the same color that
          // `grandParent` had when we started this iteration. We know that
          // `grandParent` was initially black because otherwise the tree would
          // have been invalid before insertion. Our node will therefore be
          // black.
          node.color = RBColor.Black;

          // `uncle` is black and so is our newly positioned `node`. In order
          // to keep the invariant that all paths to leaf nodes contain an
          // equal amount of black nodes, the path from `node` to `uncle` has to
          // contain a red node. This can only be `grandParent`.
          grandParent.color = RBColor.Red;

        } else {

          // We know that `grandParent` was initially black because otherwise
          // the tree would have been invalid before insertion. Since, `parent`
          // and `grandParent` are swapped, we have to set `grandParent` to
          // black.
          parent.color = RBColor.Black;

          // `uncle` is black and so is our newly positioned `parent`. In order
          // to keep the invariant that all paths to leaf nodes contain an
          // equal amount of black nodes, the path from `parent` to `uncle` has to
          // contain a red node. This can only be `grandParent`.
          grandParent.color = RBColor.Red;
        }

        this.rotateRight(grandParent);

      } else {

        if (node === parent.left) {

          // The uncle is stored in grandParent.left. After this iteration, we
          // should have performed a left rotation followed by a right rotation.
          // The first rotation is done here, while the second rotation is
          // shared with the LL case.
          this.rotateRight(parent);

          // We know that `grandParent` was initially black because otherwise
          // the tree would have been invalid before insertion. Since, `parent`
          // and `grandParent` are swapped, we have to set `grandParent` to
          // black.
          node.color = RBColor.Black;

          // `uncle` is black and so is our newly positioned `node`. In order
          // to keep the invariant that all paths to leaf nodes contain an
          // equal amount of black nodes, the path from `node` to `uncle` has to
          // contain a red node. This can only be `grandParent`.
          grandParent.color = RBColor.Red;

        } else {

          // `node` will be our new grandparent, so we pick the same color that
          // `grandParent` had when we started this iteration. We know that
          // `grandParent` was initially black because otherwise the tree would
          // have been invalid before insertion. Our node will therefore be
          // black.
          parent.color = RBColor.Black;

          // `uncle` is black and so is our newly positioned `parent`. In order
          // to keep the invariant that all paths to leaf nodes contain an
          // equal amount of black nodes, the path from `parent` to `uncle` has to
          // contain a red node. This can only be `grandParent`.
          grandParent.color = RBColor.Red;

        }

        this.rotateLeft(grandParent);

      }

      // Tree has been fixed. The case where we need to fix the parent node has
      // been covered at the beginning of the loop.
      break;
    }

    // We don't have to check for undefined because this function is only called
    // when a node has been inserted.
    const root = this.root as RBNode<T>;

    // The root node can in theory be of any color, but we prefer black.
    root.color = RBColor.Black;
  }

  /**
   * Delete an element from the tree by providing its location in the tree with
   * an {@link RBTreeIndexCursor}.
   *
   * This method takes `O(log(n))` time. It is slightly faster than deleting
   * the element by key due to the fact that a search for the node has already
   * been done.
   */
  public deleteAt(node: RBNode<T>): void {

    this.elementCount--;

    while (true) {

      const parent = node.parent as RBNode<T>;

      // If `node` is a leaf node without any children, this means that we can
      // delete `node` and be done with it. We just need to make sure our
      // coloring remains correct.
      if (node.left === undefined && node.right === undefined) {

        // If `node` is black, then 'replacing' it with a null node results in
        // a double-black because null counts as black. Therefore, we need to
        // fix the tree. We can't start with the parent of `node` because
        // `node` might still have a sibling.
        if (node.color === RBColor.Black) {
          this.fixDoubleBlack(node);
        }

        // This logic performs the actual deletion of `node`.
        if (node === this.root) {
          delete this.root;
        } else {
          if (node === parent.left) {
            parent.left = undefined;
          } else {
            parent.right = undefined;
          }
        }

        // We just deleted a node and our coloring is correct so there is
        // nothing more to do.
        break;

      // If `node` only has one child, we can replace the node with that child
      // and be done with it. As with the previous case, we need some extra
      // logic to ensure coloring remains correct.
      } else if (node.left === undefined || node.right === undefined) {

        const replacement = (node.left !== undefined ? node.left : node.right) as RBNode<T>;

        // This logic performs the actual deletion of `node`.
        replacement.parent = parent;
        if (node === this.root) {
          this.root = replacement;
        } else {
          if (node === parent.left) {
            parent.left = replacement;
          } else {
            parent.right = replacement;
          }
        }

        // The following covers the relatively simple case where either u or v
        // are red. Note that u and v cannot both be red at the same time due
        // to the way we constructed our tree.
        if (replacement.color === RBColor.Red || node.color === RBColor.Red) {

          // If `replacement` was red, changing it to black will ensure the
          // shrunk tree still has equal amount of black nodes when compared with
          // the sibling of `node`. If `node` itself was red, then swapping
          // it with its black replacement will have the same effect.
          replacement.color = RBColor.Black;

        // The only case remaining is the case where `node` and `replacement`
        // are double-black. In this case, we need to fix the tree starting
        // at `node`'s location, which now is `replacement`.
        } else {
          this.fixDoubleBlack(replacement);
        }

        // We just deleted a node and our coloring is correct so there is
        // nothing more to do.
        break;

      } else {

        // Alternatively, we could have used this.getRightmost(node.left)
        const replacement = node.right.getLeftmost() as RBNode<T>;
        this.swapValues(node, replacement);
        node = replacement;

      }

    }

  }

  private fixDoubleBlack(node: RBNode<T>): void {

    while (node !== this.root) {

      const sibling = this.getSibling(node) as RBNode<T> | undefined;

      // We may take the non-nullable parent of `node` because the loop
      // invariant guarantees that `node` is not the root node.
      const parent = node.parent as RBNode<T>;

      // If the sibling is not there then the double-black just transplants
      // itself to the parent node.
      if (sibling === undefined) {
        node = parent;
        continue;
      }

      const siblingLeft = sibling.left as RBNode<T> | undefined;
      const siblingRight = sibling.right as RBNode<T> | undefined;

      // First case where the sibling is a red node. In essence, we
      // 'transplant' the red node to the other side of the tree so that
      // we have an easier time fixing the tree. In particular, we'd like to
      // trigger the case where the sibling is completely black and the parent
      // is red. If so, the iteration would be done.
      if (sibling.color === RBColor.Red) {

        if (parent.right === sibling) {
          this.rotateLeft(parent)
        } else {
          this.rotateRight(parent);
        }

        // We swapped `parent` with `sibling` by doing the rotation. Now
        // `parent` should be red, because that was the color of the sibling.
        parent.color = RBColor.Red;

        // `sibling` can only be black because the parent had to be black
        // before the rotation and we already have a red `parent` as one of the
        // children.
        sibling.color = RBColor.Black;

      // Second case is when sibling node is black and both of its children are
      // black too.
      } else if (sibling.color === RBColor.Black
            && (siblingLeft === undefined || siblingLeft.color === RBColor.Black)
            && (siblingRight === undefined || siblingRight.color === RBColor.Black)) {

        // In order to fix the double black, we color the sibling red. Now
        // there's one black less in the path passing through the sibling,
        // which makes the path compatible with the path to the node that was
        // deleted. The paths to the parent still pose a problem, though.
        sibling.color = RBColor.Red;

        // If the parent is red, we can simply color it black and stop right
        // there. After all, the blackness of the node that was removed has
        // now been re-introduced in the parent.
        if (parent.color === RBColor.Red) {
          parent.color = RBColor.Black;
          break;
        }

        // If the previous fix didn't work, then we just continue the loop with our
        // broken parent node.
        node = parent;

      // Third case is when sibling is black but it has at least one child that
      // is red. We don't have to check whether this really is the case
      // because all other cases have already been handled.
      } else {

        // We can make this variable non-nullable because we know the red child
        // must exist and `null` counts as a black node.
        const redChild = (siblingLeft !== undefined && siblingLeft.color === RBColor.Red ? sibling.left! : sibling.right) as RBNode<T>;

        if (sibling === parent.right) {

          if (redChild === sibling.left) {

            this.rotateRight(sibling);

            // We will have done two rotations by the end of this iteration,
            // after which `redChild` will have become the new parent node. We
            // simply copy the color of the parent into our child.
            redChild.color = parent.color;

          } else {

            // The red child's parent named `sibling` could only be black in
            // order to keep the tree valid, so given that `redChild` takes the
            // place of its parent, it should also take its black color.
            redChild.color = RBColor.Black;

            // We don't know anything about `parent`, so we just have to copy
            // whatever value it has over to our new parent node named
            // `sibling`.
            sibling.color = parent.color;

          }

          this.rotateLeft(parent);

        } else {

          if (redChild === sibling.right) {

            this.rotateLeft(sibling);

            // We will have done two rotations by the end of this iteration,
            // after which `redChild` will have become the new parent node. We
            // simply copy the color of the parent into our child.
            redChild.color = parent.color;

          } else {

            // The red child's parent named `sibling` could only be black in
            // order to keep the tree valid, so given that `redChild` takes the
            // place of its parent, it should also take its black color.
            redChild.color = RBColor.Black;

            // We don't know anything about `parent`, so we just have to copy
            // whatever value it has over to our new parent node named
            // `sibling`.
            sibling.color = parent.color;

          }

          this.rotateRight(parent);

        }

        // No matter if LL, LR, RL or RR, `parent` takes the place of our
        // double-black node. If that node wasn't provably black we wouldn't be
        // running this iteration.
        parent.color = RBColor.Black;

        break;

      }

    }

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
   * Make a shallow copy of this tree so that the new tree contains the exact
   * same elements but inserting and removing elements will not change the
   * original tree.
   *
   * ```
   * import { RBTreeIndex } from "scl";
   *
   * const index = new RBTreeIndex<number>([1, 2, 3]);
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
  public clone(): RBTreeIndex<T, K> {
    return new RBTreeIndex({
      elements: this,
      compareKeys: this.isKeyLessThan,
      getKey: this.getKey,
    })
  }

}

export default RBTreeIndex;
