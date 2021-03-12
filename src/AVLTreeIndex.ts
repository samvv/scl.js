
import { BSNode, BSNodeRange, BST, BSTreeIndexOptions, equalKeysNoStrict } from "./BSTreeIndex";
import { AddResult } from "./interfaces";
import { checkInvariants } from "./test/invariants";
import {
  liftLesser,
  RangeBase,
} from "./util";

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

// function rotateLeft<T>(node: AVLNode<T>) {
//   const rightNode = node.right!;
//   node.right    = rightNode.left;

//   if (rightNode.left) { rightNode.left.parent = node; }

//   rightNode.parent = node.parent;
//   if (rightNode.parent) {
//     if (rightNode.parent.left === node) {
//       rightNode.parent.left = rightNode;
//     } else {
//       rightNode.parent.right = rightNode;
//     }
//   }

//   node.parent    = rightNode;
//   rightNode.left = node;

//   node.balance += 1;
//   if (rightNode.balance < 0) {
//     node.balance -= rightNode.balance;
//   }

//   rightNode.balance += 1;
//   if (node.balance > 0) {
//     rightNode.balance += node.balance;
//   }
//   return rightNode;
// }

// function rotateRight<T>(node: AVLNode<T>) {
//   const leftNode = node.left!;
//   node.left = leftNode.right;
//   if (node.left) { node.left.parent = node; }

//   leftNode.parent = node.parent;
//   if (leftNode.parent) {
//     if (leftNode.parent.left === node) {
//       leftNode.parent.left = leftNode;
//     } else {
//       leftNode.parent.right = leftNode;
//     }
//   }

//   node.parent    = leftNode;
//   leftNode.right = node;

//   node.balance -= 1;
//   if (leftNode.balance > 0) {
//     node.balance -= leftNode.balance;
//   }

//   leftNode.balance -= 1;
//   if (node.balance < 0) {
//     leftNode.balance += node.balance;
//   }

//   return leftNode;
// }

type AddHint<T> = [boolean, AVLNode<T> | null, number?];

export interface AVLTreeIndexOptions<T, K = T> extends BSTreeIndexOptions<T, K> {

}

/**
 * A tree-like data structure that implements the Adelson-Velsky and Landis
 * algorithm for inserting and deleting nodes. The tree will always be almost
 * completely balanced and is very performant when there are frequent lookups
 * but not as much mutations.
 *
 * You can use this data structure to index objects based on some kind of
 * propery, like so:
 *
 * ```
 * import { AVLTreeIndex } from "scl";
 *
 * interface Person {
 *   firstName: string
 *   email: string,
 *   age: number,
 * }
 *
 * const personsSortedByAge = new AVLTreeIndex<Person, number>([
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
 * | Property name                              | Worst case   |
 * |--------------------------------------------|--------------|
 * | {@link AVLTreeIndex.add add()}             | `O(log(n))`  |
 * | {@link AVLTreeIndex.clear clear()}         | `O(1)`       |
 * | {@link AVLTreeIndex.equalKeys equalKeys()} | `O(log(n))`  |
 * | {@link AVLTreeIndex.delete delete()}       | `O(log(n))`  |
 * | {@link AVLTreeIndex.deleteAll deleteAll()} | `O(log(n))`  |
 * | {@link AVLTreeIndex.deleteAt deleteAt()}   | `O(log(n))`  |
 * | {@link AVLTreeIndex.size size}             | `O(1)`       |
 */
export class AVLTreeIndex<T, K = T> extends BST<T, K> {

  protected compare: (a: K, b: K) => number;

  constructor(opts: Iterable<T> | AVLTreeIndexOptions<T, K> = {}) {
    super({
      createNode: value => new AVLNode(value),
      ...opts
    });
    this.compare = liftLesser(this.isKeyLessThan);
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

  public rotateLeftThenRight(node: AVLNode<T>): AVLNode<T> { 
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
   * This operation takes `O(log(n))` time.
   */
  public add(element: T, hint?: unknown): AddResult<T> {

    const [didInsert, insertedNode] = super.add(element, hint) as [boolean, AVLNode<T>];

    if (!didInsert) {
      return [false, insertedNode];
    }

    if (this.root === insertedNode) {
      return [true, this.root];
    }

    const key = this.getKey(element);

    let node: AVLNode<T> = insertedNode;
    let grandparent;

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

  public equalKeys(key: K): BSNodeRange<T> {
    return equalKeysNoStrict(this, key);
  }

  /**
   * Takes `O(log(n))` time, and is slightly faster than deleting the element
   * by key due to the fact that a search for the node has already been done.
   */
  public deleteAt(node: AVLNode<T>): void {

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

    let G: AVLNode<T> | null;

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
