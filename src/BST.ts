import { AddResult, CollectionRange, Index } from "./interfaces";
import { isEqual, getKey, isIterable, lessThan } from "./util";

export interface BSNodeLike<T> {
  parentNode: BSNodeLike<T> | null;
  value: T;
  left: BSNodeLike<T> | null;
  right: BSNodeLike<T> | null;
}

export class BSNode<T> implements BSNodeLike<T> {

  constructor(
    public parentNode: BSNode<T> | null = null,
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
    while (node.parentNode !== null && node === node.parentNode.right) {
      node = node.parentNode;
    }
    return node.parentNode;
  }

  public getUncle(): BSNode<T> | null {
    if (this.parentNode === null || this.parentNode.parentNode === null) {
      return null;
    }
    const parent = this.parentNode;
    const grandParent = this.parentNode.parentNode;
    return grandParent.left === parent
      ? grandParent.right
      : grandParent.left;
  }

}

export class BSNodeRange<T> implements CollectionRange<T> {

  constructor(public min: BSNode<T> | null, public max: BSNode<T> | null, private nodeCount: number) {
    
  }

  public get size(): number {
    return this.nodeCount;
  }

  public *cursors() {
    let node = this.min;
    while (node !== null) {
      yield node;
      if (node === this.max) {
        break;
      }
      node = node.next();
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
export abstract class BST<T, K = T> implements Index<T, K> {

  protected elementCount = 0;

  protected rootNode: BSNode<T> | null = null;

  public getKey: (element: T) => K;
  public compareKeys: (a: K, b: K) => boolean;
  public isEqual: (a: T, b: T) => boolean;
  public allowDuplicates = false;

  public constructor(opts: Iterable<T> | BSTOptions<T, K> = {}) {
    let elements: Iterable<T> = [];
    if (isIterable(opts)) {
      elements = opts;
      opts = {};
    } else if (opts.elements !== undefined) {
      elements = opts.elements;
    }
    this.getKey = opts.getKey ?? getKey;
    this.compareKeys = opts.compareKeys ?? lessThan;
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
    const key = this.getKey(element);
    let node = this.findKey(key);
    while (node !== null) {
      if (this.isEqual(node.value, element)) {
        this.deleteAt(node);
      }
      deleteCount++;
      if (node.right !== null && !this.compareKeys(key, this.getKey(node.right.value))) {
        node = node.right;
      }
    }
    return deleteCount;
  }

  public deleteKey(key: K): number {
    let deleteCount = 0;
    let node = this.findKey(key);
    while (node !== null) {
      this.deleteAt(node);
      deleteCount++;
      if (node.right !== null && !this.compareKeys(key, this.getKey(node.right.value))) {
        node = node.right;
      }
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
    if (node === this.rootNode) {
      this.rootNode = newNode;
    } else {
      const parent = node.parentNode!;
      if (parent.left === node) {
        parent.left = newNode;
      } else {
        parent.right = newNode;
      }
    }
    newNode.parentNode = node.parentNode;
    node.parentNode = right;
    node.right = right.left;
    if (right.left !== null) {
      right.left.parentNode = node;
    }
    right.left = node;
    node.parentNode = right;
  }

  protected rotateRight(node: BSNode<T>) {
    const left = node.left!;
    const newNode = node.left!;
    if (node === this.rootNode) {
      this.rootNode = newNode;
    } else {
      const parent = node.parentNode!;
      if (parent.left === node) {
        parent.left = newNode;
      } else {
        parent.right = newNode;
      }
    }
    newNode.parentNode = node.parentNode;
    node.parentNode = left;
    node.left = left.right;
    if (left.right !== null) {
      left.right.parentNode = node;
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

  public findKey(key: K): BSNode<T> | null {
    let node = this.rootNode;
    while (node !== null) {
      const otherKey = this.getKey(node.value);
      if (this.compareKeys(key, otherKey)) {
        node = node.left;
      } else if (this.compareKeys(otherKey, key)) {
        node = node.right;
      } else {
        return node;
      }
    }
    return null;
  }

  protected insertNode(node: BSNode<T>): boolean {

    const key = this.getKey(node.value);

    if (this.rootNode === null) {
      this.rootNode = node;
      return true;
    }

    let currNode = this.rootNode;
    while (true) {
      const currKey = this.getKey(currNode.value);
      if (this.compareKeys(key, currKey)) {
        if (currNode.left === null) {
          currNode.left = node;
          node.parentNode = currNode;
          break;
        } else {
          currNode = currNode.left;
        }
      } else {
        if (currNode.right === null) {
          if (!this.allowDuplicates && !this.compareKeys(currKey, key)) {
            return false;
          }
          currNode.right = node;
          node.parentNode = currNode;
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
    const parent = node.parentNode!;
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
    this.rootNode = null;
    this.elementCount = 0;
  }

  public toRange() {
    return new BSNodeRange(
      this.rootNode !== null ? this.rootNode.getLeftmost() : null,
      null,
      this.elementCount
    );
  }

  public has(element: T): boolean {
    return this.findKey(this.getKey(element)) !== null;
  }

  public hasKey(key: K): boolean {
    return this.findKey(key) !== null;
  }

  public lowerKey(key: K): BSNode<T> | null {
    let node = this.rootNode;
    while (node !== null) {
      const nodeKey = this.getKey(node.value);
      if (this.compareKeys(key, nodeKey)) {
        node = node.left;
      } else if (node.right === null) {
        return node;
      } else {
        node = node.right;
      }
    }
    return null;
  }

  public upperKey(key: K): BSNode<T> | null {
    let node = this.rootNode;
    while (node !== null) {
      const nodeKey = this.getKey(node.value);
      if (this.compareKeys(nodeKey, key)) {
        node = node.right;
      } else if (node.left === null) {
        return node;
      } else {
        node = node.left;
      }
    }
    return null;
  }

  public equalKeys(key: K): BSNodeRange<T> {
    const min = this.findKey(key);
    if (min === null) {
      return new BSNodeRange(null, null, 0);
    }
    let count = 1;
    let max = min;
    while (max.right !== null && !this.compareKeys(this.getKey(max.right.value), key)) {
      max = max.right;
      count++;
    }
    return new BSNodeRange(min, max, count);
  }

  public *[Symbol.iterator]() {
    for (let node = this.rootNode; node !== null; node = node.next()) {
      yield node.value;
    }
  }

}
