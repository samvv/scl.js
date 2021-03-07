
import { Cursor, Index } from "./interfaces";
import {
  CursorBase,
  getKey as defaultGetKey,
  lessThan as defaultLessThan,
  liftLesser,
  RangeBase,
  isEqual as defaultIsEqual,
  isIterable
} from "./util";

export class Node<T> extends CursorBase<T> {

  public balance: number = 0;
  public left: Node<T> | null = null;
  public right: Node<T> | null =  null;
 
  public leftThread: Node<T> | null = null;
  public rightThread: Node<T> | null = null;

  constructor(public value: T, public parent: Node<T> | null = null) {
    super();
  }

  public next(): Node<T> | null {
    if (this.right !== null) {
      let node = this.right;
      while (node.left !== null) {
        node = node.left;
      }
      return node;
    }
    let node: Node<T> = this;
    while (node.parent !== null && node === node.parent.right) {
      node = node.parent;
    }
    return node.parent;
  }

  public prev(): Node<T> | null {
    if (this.left !== null) {
      let node = this.left;
      while (node.right !== null) {
        node = node.right;
      }
      return node;
    }

    let node: Node<T> = this;
    while (node.parent !== null && node === node.parent.left) {
      node = node.parent;
    }
    return node.parent;
  }

}

export class NodeRange<T> extends RangeBase<T> {

  constructor(public min: Node<T> | null, public max: Node<T> | null, public readonly reversed = false) {
    super();
  }

  public reverse() {
    return new NodeRange<T>(this.min, this.max, !this.reversed);
  }

  get size() {
    // FIXME can be optimised
    return [...this].length;
  }

  public *[Symbol.iterator]() {
    for (const node of this.cursors()) {
      yield node.value;
    }
  }

  public *cursors() {
    if (!this.reversed) {
      let node = this.min;
      const max = this.max;
      while (node !== null) {
        yield node;
        if (node === max) {
          break;
        }
        node = node.next();
      }
    } else {
      let node = this.max
      const min = this.min;
      while (node !== null) {
        yield node;
        if (node === min) {
          break;
        }
        node = node.prev();
      }
    }
  }

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

export interface AVLTreeOptions<T, K = T> {

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
 * A tree-like data structure that implements the Adelson-Velsky and Landis
 * algorithm for inserting and deleting nodes. The tree will always be almost
 * completely balanced and is very performant when there are frequent lookups
 * but not as much mutations.
 *
 * You can use this data structure to index objects based on some kind of
 * propery, like so:
 *
 * ```
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
export class AVLTreeIndex<T, K = T> implements Index<T, K> {

  get size() {
    return this._size;
  }

  protected compare: (a: K, b: K) => number;
  protected _size = 0;
  protected _root: Node<T> | null = null;

  public compareKeys: (a: K, b: K) => boolean;
  public getKey: (element: T) => K;
  public isEqual: (a: T, b: T) => boolean;
  public allowDuplicates: boolean;

  constructor(opts: Iterable<T> | AVLTreeOptions<T, K>) {
    let elements: Iterable<T> = [];
    if (isIterable(opts)) {
      elements = opts;
      opts = {};
    } else if (opts.elements !== undefined) {
      elements = opts.elements;
    }
    this.compareKeys = opts.compareKeys ?? defaultLessThan
    this.compare = liftLesser(this.compareKeys);
    this.getKey = opts.getKey ?? defaultGetKey
    this.isEqual = opts.isEqual ?? defaultIsEqual
    this.allowDuplicates = opts.allowDuplicates ?? true;
    for (const element of elements) {
      this.add(element);
    }
  }

  /**
   * This method always runs in `O(1)` time.
   */
  public clear() {
    this._root = null;
    this._size = 0;
  }

  public getAddHint(value: T): AddHint<T> {

    const key = this.getKey(value);
    let node = this._root;
    let parent = null;
    let cmp;

    if (!this.allowDuplicates) {
      while (node !== null) {
        cmp = this.compare(key, this.getKey(node.value));
        parent = node;
        if (cmp === 0) {
          return [false, node];
        } else  if (cmp < 0) {
          node = node.left;
        } else {
          node = node.right;
        }
      }
    } else {
      while (node !== null) {
        cmp = this.compare(key, this.getKey(node.value));
        parent = node;
        if (cmp <= 0) {
          // FIXME should I return null?
          node = node.left;
        } else {
          node = node.right;
        }
      }
    }

    return [true, parent, cmp];
  }

  /**
   * This operation takes `O(log(n))` time.
   */
  public add(value: T, hint?: AddHint<T>): [boolean, Cursor<T>] {
    if (this._root === null) {
      this._root = new Node<T>(value);
      this._size++;
      return [true, this._root];
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

        if (parent === this._root) {
          this._root = newRoot;
        }
        break;
      } else if (parent.balance > 1) {
        // inlined
        // let newRoot = leftBalance(parent);
        if (parent.left!.balance === -1) {
          rotateLeft(parent.left!);
        }
        newRoot = rotateRight(parent);

        if (parent === this._root) {
          this._root = newRoot;
        }
        break;
      }
      parent = parent.parent;
    }

    this._size++;
    return [true, newNode];
  }

  public has(element: T): boolean {
    for (const node of this.equalKeys(this.getKey(element)).cursors()) {
      if (this.isEqual(node.value, element)) {
        return true;
      }
    }
    return false;
  }

  /**
   * This method takes `O(log(n))` time.
   */
  public hasKey(key: K): boolean {
    return this.findKey(key) !== null;
  }

  /**
   * This method always returns the topmost node that contains the given key,
   * which means that calling {@link Cursor.next next()} on the result will
   * always return a node with the same key if there is any.
   *
   * This method takes `O(log(n))` time.
   *
   * @param key The key so search for.
   */
  public findKey(key: K): Node<T> | null {
    let node = this._root;
    const compare = this.compare;
    const getKey = this.getKey;
    while (node !== null) {
      const cmp = compare(key, getKey(node.value));
      if (cmp < 0) {
        node = node.left;
      } else if (cmp > 0) {
        node = node.right;
      } else {
        return node;
      }
    }
    return null;
  }

  /**
   * @ignore
   */
  public _findMin(key: K, node = this.findKey(key)): Node<T> | null {
    if (node === null) {
      return null;
    }
    const cmp = this.compare(key, this.getKey(node.value));
    if (cmp < 0) {
      return this._findMin(key, node.left);
    }
    if (cmp > 0) {
      return this._findMin(key, node.right);
    }
    return this._findMin(key, node.left) || node;
  }

  /**
   * @ignore
   */
  public _findMax(key: K, node = this.findKey(key)): Node<T> | null {
    if (node === null) {
      return null;
    }
    const cmp = this.compare(key, this.getKey(node.value));
    if (cmp < 0) {
      return this._findMax(key, node.left);
    }
    if (cmp > 0) {
      return this._findMax(key, node.right);
    }
    return this._findMax(key, node.right) || node;
  }

  /**
   * This methods generally returns in `O(log(n))` time, but this might become `O(n)` in
   * the case where multiple elements with the same key are allowed.
   */
  public equalKeys(key: K): NodeRange<T> {
    const top = this.findKey(key);
    const min = this._findMin(key, top);
    const max = this._findMax(key, top);
    return new NodeRange<T>(min, max);
  }

  public lowerKey(key: K): Node<T> | null {
    let node = this._root;
    while (node !== null && this.compare(this.getKey(node.value), key) > 0) {
      if (node.left !== null) {
        node = node.left;
      } else {
        node = null;
        break;
      }
    }
    if (node !== null && this.compare(this.getKey(node.value), key) === 0 && node.right !== null) {
      node = node.right;
      while (node.left !== null) {
        node = node.left;
      }
    }
    return node;
  }

  public upperKey(key: K): Node<T> | null {
    let node = this._root;
    while (node !== null && this.compare(this.getKey(node.value), key) < 0) {
      if (node.right !== null) {
        node = node.right;
      } else {
        node = null;
        break;
      }
    }
    if (node !== null && this.compare(this.getKey(node.value), key) === 0) {
      node = node.left;
      if (node !== null) {
        while (node.right !== null) { node = node.right; }
      }
    }

    return node;
  }

  public toRange() {
    return new NodeRange(this.begin(), this.end());
  }

  public begin(): Node<T> | null {
    if (this._root === null) { return null; }
    let node = this._root;
    while (node.left !== null) { node = node.left; }
    return node;
  }

  public end(): Node<T> | null {
    if (this._root === null) { return null; }
    let node = this._root;
    while (node.right !== null) { node = node.right; }
    return node;
  }

  public *[Symbol.iterator]() {
    // TODO issue #12
    for (const value of this.toRange()) {
      yield value;
    }
  }

  /**
   * This operation generally takes `O(log(n))` time, unless multiple entries
   * with the same key are allowed. In that case, the complexity can grow to
   * `O(n)`.
   */
  public deleteKey(key: K): number {
    let deleteCount = 0;
    for (const node of this.equalKeys(key).cursors()) {
      this.deleteAt(node);
      ++deleteCount;
    }
    return deleteCount;
  }

  /**
   * This operation generally takes `O(log(n))` time, unless multiple entries
   * with the same key are allowed. In that case, the complexity can grow to
   * `O(n)`.
   */
  public deleteAll(value: T): number {
    let deleteCount = 0;
    for (const node of  this.equalKeys(this.getKey(value)).cursors()) {
      if (this.isEqual(node.value, value)) {
        this.deleteAt(node);
        ++deleteCount;
      }
    }
    return deleteCount;
  }

  /**
   * This method takes at most `O(log(n))` time, where `n` is the amount of
   * elements in the collection.
   */
  public delete(element: T): boolean {
    for (const node of this.equalKeys(this.getKey(element)).cursors()) {
      if (this.isEqual(node.value, element)) {
        this.deleteAt(node);
        return true;
      }
    }
    return false;
  }

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

    let parent = node.parent;
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

        if (parent === this._root) {
          this._root = newRoot;
        }
        parent = newRoot;
      } else if (parent.balance > 1) {
        // inlined
        // let newRoot = leftBalance(parent);
        if (parent.left!.balance === -1) {
          rotateLeft(parent.left!);
        }
        newRoot = rotateRight(parent);

        if (parent === this._root) {
          this._root = newRoot;
        }
        parent = newRoot;
      }

      if (parent.balance === -1 || parent.balance === 1) {
        break;
      }

      child = parent;
      parent = parent.parent;
    }

    if (node.parent) {
      if (node.parent.left === node) {
        node.parent.left  = null;
      } else {
        node.parent.right = null;
      }
    }

    if (node === this._root) {
      this._root = null;
    }

    this._size--;
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
