
import { BSNode, BSNodeRange, BST, BSTOptions, equalKeysNoStrict } from "./BST";
import { Cursor, Index } from "./interfaces";
import {
  liftLesser,
  RangeBase,
} from "./util";

export class Node<T> extends BSNode<T> {

  constructor(
    value: T,
    parent: Node<T> | null = null,
    public left: Node<T> | null = null,
    public right: Node<T> | null =  null,
    public balance: number = 0
  ) {
    super(parent, value, left, right);
  }

  // public next(): Node<T> | null {
  //   if (this.right !== null) {
  //     let node = this.right;
  //     while (node.left !== null) {
  //       node = node.left;
  //     }
  //     return node;
  //   }
  //   let node: Node<T> = this;
  //   while (node.parent !== null && node === node.parent.right) {
  //     node = node.parent as Node<T>;
  //   }
  //   return node.parent as BSNode<T>;
  // }

  // public prev(): Node<T> | null {
  //   if (this.left !== null) {
  //     let node = this.left;
  //     while (node.right !== null) {
  //       node = node.right;
  //     }
  //     return node;
  //   }

  //   let node: Node<T> = this;
  //   while (node.parent !== null && node === node.parent.left) {
  //     node = node.parent;
  //   }
  //   return node.parent;
  // }

}

function rotateLeft<T>(node: Node<T>) {
  const rightNode = node.right!;
  node.right    = rightNode.left;

  if (rightNode.left) { rightNode.left.parent = node; }

  rightNode.parent = node.parent;
  if (rightNode.parent) {
    if (rightNode.parent.left === node) {
      rightNode.parent.left = rightNode;
    } else {
      rightNode.parent.right = rightNode;
    }
  }

  node.parent    = rightNode;
  rightNode.left = node;

  node.balance += 1;
  if (rightNode.balance < 0) {
    node.balance -= rightNode.balance;
  }

  rightNode.balance += 1;
  if (node.balance > 0) {
    rightNode.balance += node.balance;
  }
  return rightNode;
}

function rotateRight<T>(node: Node<T>) {
  const leftNode = node.left!;
  node.left = leftNode.right;
  if (node.left) { node.left.parent = node; }

  leftNode.parent = node.parent;
  if (leftNode.parent) {
    if (leftNode.parent.left === node) {
      leftNode.parent.left = leftNode;
    } else {
      leftNode.parent.right = leftNode;
    }
  }

  node.parent    = leftNode;
  leftNode.right = node;

  node.balance -= 1;
  if (leftNode.balance > 0) {
    node.balance -= leftNode.balance;
  }

  leftNode.balance -= 1;
  if (node.balance < 0) {
    leftNode.balance += node.balance;
  }

  return leftNode;
}

type AddHint<T> = [boolean, Node<T> | null, number?];

export interface AVLTreeIndexOptions<T, K = T> extends BSTOptions<T, K> {

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
    super(opts);
    this.compare = liftLesser(this.compareKeys);
  }

  public getAddHint(value: T): AddHint<T> {

    const key = this.getKey(value);
    let node = this.rootNode as Node<T>;
    let parent = null;
    let cmp;

    if (!this.allowDuplicates) {
      while (node !== null) {
        cmp = this.compare(key, this.getKey(node.value));
        parent = node;
        if (cmp === 0) {
          return [false, node];
        } else if (cmp < 0) {
          node = node.left as Node<T>;
        } else {
          node = node.right as Node<T>;
        }
      }
    } else {
      while (node !== null) {
        cmp = this.compare(key, this.getKey(node.value));
        parent = node;
        if (cmp <= 0) {
          // FIXME should I return null?
          node = node.left as Node<T>;
        } else {
          node = node.right as Node<T>;
        }
      }
    }

    return [true, parent, cmp];
  }

  /**
   * This operation takes `O(log(n))` time.
   */
  public add(value: T, hint?: AddHint<T>): [boolean, Cursor<T>] {

    if (this.rootNode === null) {
      this.rootNode = new Node<T>(value);
      this.elementCount++;
      return [true, this.rootNode];
    }

    const getKey = this.getKey;
    if (hint === undefined) {
      hint = this.getAddHint(value);
    }

    if (hint[0] === false) {
      return hint as [boolean, Node<T>];
    }

    let parent = hint[1];
    let cmp = hint[2]!;

    const compare = this.compare;
    const newNode = new Node<T>(value, parent);
    let newRoot;
    if (cmp <= 0) {
      parent!.left  = newNode;
    } else {
      parent!.right = newNode; 
    }

    while (parent !== null) {
      cmp = compare(getKey(parent.value), getKey(value));
      if (cmp < 0) {
        parent.balance -= 1;
      } else {
        parent.balance += 1;
      }

      if (parent.balance === 0) {
        break; 
      } else if (parent.balance < -1) {
        // inlined
        // let newRoot = rightBalance(parent);
        if (parent.right!.balance === 1) {
          rotateRight(parent.right!);
        }
        newRoot = rotateLeft(parent);

        if (parent === this.rootNode) {
          this.rootNode = newRoot;
        }
        break;
      } else if (parent.balance > 1) {
        // inlined
        // let newRoot = leftBalance(parent);
        if (parent.left!.balance === -1) {
          rotateLeft(parent.left!);
        }
        newRoot = rotateRight(parent);

        if (parent === this.rootNode) {
          this.rootNode = newRoot;
        }
        break;
      }
      parent = parent.parent as Node<T>;
    }

    this.elementCount++;
    return [true, newNode];
  }

  public equalKeys(key: K): BSNodeRange<T> {
    return equalKeysNoStrict(this, key);
  }

  // protected findMinEqual(key: K, node: Node<T> | null): Node<T> | null {
  //   if (node === null) {
  //     return null;
  //   }
  //   const cmp = this.compare(key, this.getKey(node.value));
  //   if (cmp < 0) {
  //     return this.findMinEqual(key, node.left);
  //   }
  //   if (cmp > 0) {
  //     return this.findMinEqual(key, node.right);
  //   }
  //   return this.findMinEqual(key, node.left) || node as Node<T>;
  // }

  // protected findMaxEqual(key: K, node: Node<T> | null): Node<T> | null {
  //   if (node === null) {
  //     return null;
  //   }
  //   const cmp = this.compare(key, this.getKey(node.value));
  //   if (cmp < 0) {
  //     return this.findMaxEqual(key, node.left);
  //   }
  //   if (cmp > 0) {
  //     return this.findMaxEqual(key, node.right);
  //   }
  //   return this.findMaxEqual(key, node.right) || node as Node<T>;
  // }

  // /**
  //  * This methods generally returns in `O(log(n))` time, but this might become `O(n)` in
  //  * the case where multiple elements with the same key are allowed.
  //  */
  // public equalKeys(key: K): BSNodeRange<T> {
  //   // We need to override this method because the standard implementation of an
  //   // AVL tree does not retain the property that L < R when inserting duplicate
  //   // keys. The core operations remain the same, but duplicates have to be
  //   // searched on the left and on the right.
  //   const top = this.findKey(key) as Node<T>;
  //   const min = this.findMinEqual(key, top);
  //   const max = this.findMaxEqual(key, top);
  //   return new BSNodeRange(min, max, undefined, false);
  // }

  // public lowerKey(key: K): Node<T> | null {
  //   let node = this.root;
  //   while (node !== null && this.compare(this.getKey(node.value), key) > 0) {
  //     if (node.left !== null) {
  //       node = node.left;
  //     } else {
  //       node = null;
  //       break;
  //     }
  //   }
  //   if (node !== null && this.compare(this.getKey(node.value), key) === 0 && node.right !== null) {
  //     node = node.right;
  //     while (node.left !== null) {
  //       node = node.left;
  //     }
  //   }
  //   return node;
  // }

  // public upperKey(key: K): Node<T> | null {
  //   let node = this.root;
  //   while (node !== null && this.compare(this.getKey(node.value), key) < 0) {
  //     if (node.right !== null) {
  //       node = node.right;
  //     } else {
  //       node = null;
  //       break;
  //     }
  //   }
  //   if (node !== null && this.compare(this.getKey(node.value), key) === 0) {
  //     node = node.left;
  //     if (node !== null) {
  //       while (node.right !== null) { node = node.right; }
  //     }
  //   }

  //   return node;
  // }

  /**
   * This operation generally takes `O(log(n))` time, unless multiple entries
   * with the same key are allowed. In that case, the complexity can grow to
   * `O(n)`.
   */
  // public deleteKey(key: K): number {
  //   let deleteCount = 0;
  //   for (const node of this.equalKeys(key).cursors()) {
  //     this.deleteAt(node);
  //     ++deleteCount;
  //   }
  //   return deleteCount;
  // }

  /**
   * This operation generally takes `O(log(n))` time, unless multiple entries
   * with the same key are allowed. In that case, the complexity can grow to
   * `O(n)`.
   */
  // public deleteAll(value: T): number {
  //   let deleteCount = 0;
  //   for (const node of  this.equalKeys(this.getKey(value)).cursors()) {
  //     if (this.isEqual(node.value, value)) {
  //       this.deleteAt(node as Node<T>);
  //       ++deleteCount;
  //     }
  //   }
  //   return deleteCount;
  // }

  /**
   * This method takes at most `O(log(n))` time, where `n` is the amount of
   * elements in the collection.
   */
  // public delete(element: T): boolean {
  //   for (const node of this.equalKeys(this.getKey(element)).cursors()) {
  //     if (this.isEqual(node.value, element)) {
  //       this.deleteAt(node as Node<T>);
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  /**
   * Takes `O(log(n))` time, and is slightly faster than deleting the element
   * by key due to the fact that a search for the node has already been done.
   */
  public deleteAt(node: Node<T>): void {

    let max;
    let min;

    if (node.left !== null) {

      max = node.left;

      while (max.left !== null || max.right !== null) {

        while (max.right !== null) {
          max = max.right;
        }

        node.value = max.value;

        if (max.left !== null) {
          node = max;
          max = max.left;
        }

      }

      node.value  = max.value;
      node = max;
    }

    if (node.right !== null) {

      min = node.right;

      while (min.left !== null || min.right !== null) {

        while (min.left !== null) {
          min = min.left;
        }

        node.value  = min.value;
        if (min.right !== null) {
          node = min;
          min = min.right;
        }
      }

      node.value  = min.value;
      node = min;
    }

    let parent = node.parent as Node<T>;
    let child = node;
    let newRoot;

    while (parent !== null) {

      if (parent.left === child) {
        parent.balance -= 1;
      } else {
        parent.balance += 1;
      }

      if (parent.balance < -1) {
        // inlined
        // let newRoot = rightBalance(parent);
        if (parent.right!.balance === 1) {
          rotateRight(parent.right!);
        }
        newRoot = rotateLeft(parent);

        if (parent === this.rootNode) {
          this.rootNode = newRoot;
        }
        parent = newRoot;
      } else if (parent.balance > 1) {
        // inlined
        // let newRoot = leftBalance(parent);
        if (parent.left!.balance === -1) {
          rotateLeft(parent.left!);
        }
        newRoot = rotateRight(parent);

        if (parent === this.rootNode) {
          this.rootNode = newRoot;
        }
        parent = newRoot;
      }

      if (parent.balance === -1 || parent.balance === 1) {
        break;
      }

      child = parent;
      parent = parent.parent as Node<T>;
    }

    if (node.parent) {
      if (node.parent.left === node) {
        node.parent.left  = null;
      } else {
        node.parent.right = null;
      }
    }

    if (node === this.rootNode) {
      this.rootNode = null;
    }

    this.elementCount--;
  }

  public clone() {
    return new AVLTreeIndex<T, K>({
      compareKeys: this.compareKeys
    , getKey: this.getKey
    , isEqual: this.isEqual
    , allowDuplicates: this.allowDuplicates
    , elements: this
    });
  }

}

export default AVLTreeIndex;
