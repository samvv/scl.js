import { AddResult, Range, Index, SortedIndex } from "./interfaces";
import { isEqual, getKey, isIterable, lessThan } from "./util";

export interface BSNodeLike<T> {
  parent: BSNodeLike<T> | null;
  value: T;
  left: BSNodeLike<T> | null;
  right: BSNodeLike<T> | null;
}

export class BSNode<T> implements BSNodeLike<T> {

  constructor(
    public parent: BSNode<T> | null = null,
    public value: T,
    public left: BSNode<T> | null = null,
    public right: BSNode<T> | null = null,
  ) {

  }

  /**
   * @ignore
   */
  public getLeftmost(): BSNode<T> | null {
    let node: BSNode<T> | null = this;
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  /**
   * @ignore
   */
  public getRightmost(): BSNode<T> | null {
    let node: BSNode<T> | null = this;
    while (node.right !== null) {
      node = node.right;
    }
    return node;
  }

  public next(): BSNode<T> | null {
    if (this.right !== null) {
      return this.right.getLeftmost();
    }
    let node: BSNode<T> = this;
    while (node.parent !== null && node === node.parent.right) {
      node = node.parent;
    }
    return node.parent;
  }

  public prev(): BSNode<T> | null {
    if (this.left !== null) {
      let node = this.left;
      while (node.right !== null) {
        node = node.right;
      }
      return node;
    }
    let node: BSNode<T> = this;
    while (node.parent !== null && node === node.parent.left) {
      node = node.parent;
    }
    return node.parent;
  }

  public getUncle(): BSNode<T> | null {
    if (this.parent === null || this.parent.parent === null) {
      return null;
    }
    const parent = this.parent;
    const grandParent = this.parent.parent;
    return grandParent.left === parent
      ? grandParent.right
      : grandParent.left;
  }

}

/**
 * Search for equal keys even when the binary search tree is not strictly
 * a binary search tree in the strict sense.
 * 
 * This function generally returns in `O(log(n))` time, but this might become
 * `O(n)` in the case where multiple elements with the same key are allowed.
 */
export function equalKeysNoStrict<T, K>(tree: BST<T, K>, key: K) {

  function findMinEqual(key: K, node: BSNode<T> | null): BSNode<T> | null {
    if (node === null) {
      return null;
    }
    const nodeKey = tree.getKey(node.value);
    if (tree.isKeyLessThan(key, nodeKey)) {
      return findMinEqual(key, node.left);
    }
    if (tree.isKeyLessThan(nodeKey, key)) {
      return findMinEqual(key, node.right);
    }
    return findMinEqual(key, node.left) || node;
  }

  function findMaxEqual(key: K, node: BSNode<T> | null): BSNode<T> | null {
    if (node === null) {
      return null;
    }
    const nodeKey = tree.getKey(node.value);
    if (tree.isKeyLessThan(key, nodeKey)) {
      return findMaxEqual(key, node.left);
    }
    if (tree.isKeyLessThan(nodeKey, key)) {
      return findMaxEqual(key, node.right);
    }
    return findMaxEqual(key, node.right) || node;
  }

  const top = tree.findKey(key);
  const min = findMinEqual(key, top);
  const max = findMaxEqual(key, top);
  return new BSNodeRange(min, max, undefined, false);
}

/**
 * Find duplicate keys in a binary search tree that strictly upholds the `<=`
 * relation for all its child nodes.
 */
export function equalKeysStrict<T, K>(this: BST<T, K>, key: K): BSNodeRange<T> {
  const min = this.findKey(key);
  if (min === null) {
    return new BSNodeRange(null, null, 0, false);
  }
  let count = 1;
  let max = min;
  while (true) {
    const next = max.next();
    if (next === null || this.isKeyLessThan(key, this.getKey(next.value))) {
      break;
    }
    max = next;
    count++;
  }
  return new BSNodeRange(min, max, count, false);
}

export class BSNodeRange<T> implements Range<T> {

  constructor(
    public min: BSNode<T> | null,
    public max: BSNode<T> | null,
    private nodeCount: number | undefined,
    public readonly reversed: boolean
  ) {

  }

  public get size(): number {
    if (this.nodeCount === undefined) {
      let count = 0;
      for (const node of this.cursors()) {
        count++;
      }
      return this.nodeCount = count;
    }
    return this.nodeCount;
  }

  public reverse() {
    return new BSNodeRange(
      this.min,
      this.max,
      this.nodeCount,
      !this.reversed
    )
  }

  public *cursors() {
    if (this.reversed) {
      let node = this.max;
      while (node !== null) {
        yield node;
        if (node === this.min) {
          break;
        }
        node = node.prev();
      }
    } else {
      let node = this.min;
      while (node !== null) {
        yield node;
        if (node === this.max) {
          break;
        }
        node = node.next();
      }
    }
  }

  public *[Symbol.iterator]() {
    for (const node of this.cursors()) {
      yield node.value;
    }
  }

}

export interface BSTOptions<T, K = T> {

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
   * Extracts the key part of the element.
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
 * A base implementation of binary search trees.
 */
export abstract class BST<T, K = T> implements SortedIndex<T, K> {

  protected elementCount = 0;

  protected root: BSNode<T> | null = null;

  public getKey: (element: T) => K;
  public isKeyLessThan: (a: K, b: K) => boolean;
  public isEqual: (a: T, b: T) => boolean;
  public allowDuplicates: boolean;

  public constructor(opts: Iterable<T> | BSTOptions<T, K> = {}) {
    let elements: Iterable<T> = [];
    if (isIterable(opts)) {
      elements = opts;
      opts = {};
    } else if (opts.elements !== undefined) {
      elements = opts.elements;
    }
    this.getKey = opts.getKey ?? getKey;
    this.isKeyLessThan = opts.compareKeys ?? lessThan;
    this.isEqual = opts.isEqual ?? isEqual;
    this.allowDuplicates = opts.allowDuplicates ?? false;
    for (const element of elements) {
      this.add(element);
    }
  }

  public abstract add(element: T): AddResult<T>;

  public abstract clone(): BST<T, K>;

  public delete(element: T): boolean {
    const key = this.getKey(element);
    const node = this.findKey(key);
    if (node === null || !this.isEqual(node.value, element)) {
      return false;
    }
    this.deleteAt(node);
    return true;
  }

  public deleteAll(element: T): number {
    let deleteCount = 0;
    for (const node of  this.equalKeys(this.getKey(element)).cursors()) {
      if (this.isEqual(node.value, element)) {
        this.deleteAt(node);
        ++deleteCount;
      }
    }
    return deleteCount;
  }

  public deleteKey(key: K): number {
    let deleteCount = 0;
    for (const node of  this.equalKeys(key).cursors()) {
      this.deleteAt(node);
      ++deleteCount;
    }
    return deleteCount;
  }

  public abstract deleteAt(node: BSNode<T>): void;

  public get size() {
    return this.elementCount;
  }

  protected rotateLeft(node: BSNode<T>) {
    const right = node.right!;
    const newNode = node.right!;
    if (node === this.root) {
      this.root = newNode;
    } else {
      const parent = node.parent!;
      if (parent.left === node) {
        parent.left = newNode;
      } else {
        parent.right = newNode;
      }
    }
    newNode.parent = node.parent;
    node.parent = right;
    node.right = right.left;
    if (right.left !== null) {
      right.left.parent = node;
    }
    right.left = node;
    node.parent = right;
  }

  protected rotateRight(node: BSNode<T>) {
    const left = node.left!;
    const newNode = node.left!;
    if (node === this.root) {
      this.root = newNode;
    } else {
      const parent = node.parent!;
      if (parent.left === node) {
        parent.left = newNode;
      } else {
        parent.right = newNode;
      }
    }
    newNode.parent = node.parent;
    node.parent = left;
    node.left = left.right;
    if (left.right !== null) {
      left.right.parent = node;
    }
    left.right = node;
  }

  public getLeftmost(node: BSNode<T>): BSNode<T> {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  protected getRightmost(node: BSNode<T>): BSNode<T> {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  /**
   * This method always returns the topmost node that contains the given key,
   * which means that calling {@link Cursor.next next()} on the result will
   * always return a node with the same key if there is any.
   *
   * This method takes `O(log(n))` time.
   *
   * @param key The key to search for.
   */
  public findKey(key: K): BSNode<T> | null {
    let node = this.root;
    while (node !== null) {
      const otherKey = this.getKey(node.value);
      if (this.isKeyLessThan(key, otherKey)) {
        node = node.left;
      } else if (this.isKeyLessThan(otherKey, key)) {
        node = node.right;
      } else {
        return node;
      }
    }
    return null;
  }

  protected insertNode(node: BSNode<T>): boolean {

    const key = this.getKey(node.value);

    if (this.root === null) {
      this.root = node;
      return true;
    }

    let currNode = this.root;
    while (true) {
      const currKey = this.getKey(currNode.value);
      if (this.isKeyLessThan(key, currKey)) {
        if (currNode.left === null) {
          currNode.left = node;
          node.parent = currNode;
          break;
        } else {
          currNode = currNode.left;
        }
      } else {
        if (currNode.right === null) {
          if (!this.allowDuplicates && !this.isKeyLessThan(currKey, key)) {
            return false;
          }
          currNode.right = node;
          node.parent = currNode;
          break;
        } else {
          currNode = currNode.right;
        }
      }
    }

    return true;
  }

  protected getSibling(node: BSNode<T>): BSNode<T> | null {
    if (node === null) {
      return null;
    }
    const parent = node.parent!;
    if (parent.left === node) {
      return parent.right;
    } else {
      return parent.left;
    }
  }

  protected findDeleteReplacement(node: BSNode<T>): BSNode<T> | null {
    if (node.left !== null && node.right !== null) {
      return this.getLeftmost(node.right);
    }
    if (node.right !== null) {
      return node.right;
    }
    if (node.left !== null) {
      return node.left;
    }
    return null;
  }

  protected swapValues(a: BSNode<T>, b: BSNode<T>): void {
    const keep = a.value;
    a.value = b.value;
    b.value = keep;
  }

  public clear() {
    this.root = null;
    this.elementCount = 0;
  }

  public toRange() {
    return new BSNodeRange(
      this.begin(), 
      this.end(),
      this.elementCount,
      false
    );
  }

  public has(element: T): boolean {
    for (const node of this.equalKeys(this.getKey(element)).cursors()) {
      if (this.isEqual(node.value, element)) {
        return true;
      }
    }
    return false;
  }

  public hasKey(key: K): boolean {
    return this.findKey(key) !== null;
  }

  public getNearest(key: K): BSNode<T> | null {
    let node = this.root;
    while (node !== null) {
      const nodeKey = this.getKey(node.value);
      if (this.isKeyLessThan(key, nodeKey)) {
        if (node.left === null) {
          break;
        }
        node = node.left;
      } else if (this.isKeyLessThan(nodeKey, key)) {
        if (node.right === null) {
          break;
        }
        node = node.right;
      } else {
        break;
      }
    }
    return node;
  }

  public getGreatestLowerBound(key: K): BSNode<T> | null {
    let nearest = this.getNearest(key);
    while (nearest !== null && this.isKeyLessThan(key, this.getKey(nearest.value))) {
      nearest = nearest.prev();
    }
    return nearest;
  }

  public getLeastUpperBound(key: K): BSNode<T> | null {
    let nearest = this.getNearest(key);
    while (nearest !== null && this.isKeyLessThan(this.getKey(nearest.value), key)) {
      nearest = nearest.next();
    }
    return nearest;
  }

  public abstract equalKeys(key: K): BSNodeRange<T>;

  public *[Symbol.iterator]() {
    for (let node = this.begin(); node !== null; node = node.next()) {
      yield node.value;
    }
  }

  public begin(): BSNode<T> | null {
    return this.root === null
      ? null : this.root.getLeftmost();
  }

  public end(): BSNode<T> | null {
    return this.root === null
      ? null : this.root.getRightmost();
  }

}
