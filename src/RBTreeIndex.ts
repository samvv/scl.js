import { AddResult, Index } from "./interfaces";
import { getKey, lessThan } from "./util";
import { BST, BSNodeLike, BSNode, BSTOptions } from "./BST"

const enum RBColor {
  Red,
  Black,
}

export class RBNode<T> extends BSNode<T> {

  constructor(
    parentNode: RBNode<T> | null,
    value: T,
    left: RBNode<T> | null = null,
    right: RBNode<T> | null = null,
    public color: RBColor,
  ) {
    super(parentNode, value, left, right);
  }

}

export function checkInvariants<T>(node: RBNode<T>): number {
  if (node === null) {
    return 0;
  }
  const left = node.left as RBNode<T>;
  const right = node.right as RBNode<T>;
  if (node.color === RBColor.Red) {
    if (left !== null && left.color === RBColor.Red) {
      throw new Error(`Node on the left of node with value ${node.value} is red while the parent is also red.`)
    }
    if (right !== null && right.color === RBColor.Red) {
      throw new Error(`Node on the right of node with value ${node.value} is red while the parent is also red.`)
    }
  }
  const blackCountLeft = node.left !== null ? checkInvariants(left) : 0;
  const blackCountRight = node.right !== null ? checkInvariants(right) : 0;
  if (blackCountLeft !== blackCountRight) {
    throw new Error(`The amount of black nodes on the left of node with value ${node.value} does not equal the amount of black nodes on the right`)
  }
  return blackCountLeft + node.color === RBColor.Black ? 1 : 0;
}


export interface RBTreeIndexOptions<T, K = T> extends BSTOptions<T, K> {

}

/**
 * A Red/Black tree implementation that allows for efficient lookup, deletions and insertions.
 *
 * You can use this data structure to index objects based on some kind of
 * propery, like so:
 *
 * ```
 * import { RBTreeIndex } from "scl";
 *
 * interface Person {
 *   firstName: string
 *   email: string,
 *   age: number,
 * }
 *
 * const personsSortedByAge = new RBTreeIndex<Person, number>([
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
 * The following table lists some of the performance characteristics of
 * different methods:
 *
 * | Property name                             | Worst case   |
 * |-------------------------------------------|--------------|
 * | {@link RBTreeIndex.add add()}             | `O(log(n))`  |
 * | {@link RBTreeIndex.clear clear()}         | `O(1)`       |
 * | {@link RBTreeIndex.equalKeys equalKeys()} | `O(log(n))`  |
 * | {@link RBTreeIndex.delete delete()}       | `O(log(n))`  |
 * | {@link RBTreeIndex.deleteAll deleteAll()} | `O(log(n))`  |
 * | {@link RBTreeIndex.deleteAt deleteAt()}   | `O(log(n))`  |
 * | {@link RBTreeIndex.size size}             | `O(1)`       |
 */
export class RBTreeIndex<T, K = T> extends BST<T, K> implements Index<T, K> {

  constructor(opts: RBTreeIndexOptions<T, K> = {}) {
    super(opts);
  }

  public add(element: T): AddResult<T> {

    const toInsert = new RBNode(null, element, null, null, RBColor.Red);
    const didInsert = super.insertNode(toInsert);

    if (!didInsert) {
      return [false, toInsert];
    }

    this.elementCount++;

    this.fixRedRed(toInsert);

    return [true, toInsert];
  }

  private fixRedRed(node: RBNode<T>): void {

    // We only have to loop for as long as there is a parent node that shares
    // the same red color with the child node being visited.
    while (node !== this.rootNode
        && node.color === RBColor.Red) {

      // We know the parentNode must exist because `node` wasn't the root node.
      const parent = node.parentNode as RBNode<T>;

      // This should be an invariant of the while-loop but awesome TypeScript
      // forces us to cast the parent node first.
      if (parent.color !== RBColor.Red) {
        break;
      }

      // We know the parent node's parent node must exist because the parent
      // node was red and the root node can never be red.
      const grandParent = parent.parentNode as RBNode<T>;

      // The uncle is the node next to `parent` and shares the same
      // `grandParent` with it.
      const uncle = node.getUncle() as RBNode<T> | null;

      // The following is a simple case where we just invert the colors of
      // parent, grandParent and uncle so that the only node that needs
      // checking is `grandParent`.
      if (uncle !== null && uncle.color === RBColor.Red) {
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

    // We don't have to check for null because this function is only called
    // when a node has been inserted.
    const root = this.rootNode as RBNode<T>;

    // The root node can in theory be of any color, but we prefer black.
    root.color = RBColor.Black;
  }

  public deleteAt(node: RBNode<T>): void {

    this.elementCount--;

    while (true) {

      const parent = node.parentNode as RBNode<T>;

      // If `node` is a leaf node without any children, this means that we can
      // delete `node` and be done with it. We just need to make sure our
      // coloring remains correct.
      if (node.left === null && node.right === null) {

        // If `node` is black, then 'replacing' it with a null node results in
        // a double-black because null counts as black. Therefore, we need to
        // fix the tree. We can't start with the parent of `node` because
        // `node` might still have a sibling.
        if (node.color === RBColor.Black) {
          this.fixDoubleBlack(node);
        }

        // This logic performs the actual deletion of `node`.
        if (node === this.rootNode) {
          this.rootNode = null;
        } else {
          if (node === parent.left) {
            parent.left = null;
          } else {
            parent.right = null;
          }
        }

        // We just deleted a node and our coloring is correct so there is
        // nothing more to do.
        break;

      // If `node` only has one child, we can replace the node with that child
      // and be done with it. As with the previous case, we need some extra
      // logic to ensure coloring remains correct.
      } else if (node.left === null || node.right === null) {

        const replacement = (node.left !== null ? node.left : node.right) as RBNode<T>;

        // This logic performs the actual deletion of `node`.
        replacement.parentNode = parent;
        if (node === this.rootNode) {
          this.rootNode = replacement;
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
        const replacement = this.getLeftmost(node.right) as RBNode<T>;
        this.swapValues(node, replacement);
        node = replacement;

      }

    }

  }

  private fixDoubleBlack(node: RBNode<T>): void {

    while (node !== this.rootNode) {

      const sibling = this.getSibling(node) as RBNode<T> | null;

      // We may take the non-nullable parent of `node` because the loop
      // invariant guarantees that `node` is not the root node.
      const parent = node.parentNode as RBNode<T>;

      // If the sibling is not there then the double-black just transplants
      // itself to the parent node.
      if (sibling === null) {
        node = parent;
        continue;
      }

      const siblingLeft = sibling.left as RBNode<T> | null;
      const siblingRight = sibling.right as RBNode<T> | null;

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
            && (siblingLeft === null || siblingLeft.color === RBColor.Black)
            && (siblingRight === null || siblingRight.color === RBColor.Black)) {

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
        const redChild = (siblingLeft !== null && siblingLeft.color === RBColor.Red ? sibling.left! : sibling.right) as RBNode<T>;

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

  public clone(): RBTreeIndex<T, K> {
    return new RBTreeIndex({
      elements: this,
      compareKeys: this.compareKeys,
      getKey: this.getKey,
    })
  }

  public deleteAll(element: T): number {
    const nodesToDelete = this.equalKeys(this.getKey(element));
    const deleteCount = 0;
    for (const node of nodesToDelete.cursors()) {
      if (this.isEqual(node.value, element)) {
        this.deleteAt(node as RBNode<T>);
      }
    }
    return deleteCount;
  }

}

export default RBTreeIndex;
