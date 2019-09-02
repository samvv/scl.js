
import { KeyedCollection, Cursor, CollectionRange } from "../interfaces"
import { liftLesser, lesser } from "../util"

class Node<T> implements Cursor<T> {

  balance: number = 0;
  left: Node<T> | null = null;
  right: Node<T> | null=  null;
  data?: any;

  constructor(public value: T, public parent: Node<T> | null = null) {

  }

  *[Symbol.iterator]() {
    let node: Node<T> | null = this;
    do {
      yield node.value;
      node = node.next();
    } while (node !== null);
  }

  next(): Node<T> | null {
    if (this.right !== null) {
      let node = this.right;
      while (node.left !== null) node = node.left;
      return node;
    }
  
    let node: Node<T> = this;
    while (node.parent !== null && node === node.parent.right) {
      node = node.parent;
    }
    return node.parent;
  }

  prev(): Node<T> | null {
    if (this.left !== null) { 
      let node = this.left;
      while (node.right !== null) node = node.right;
      return node;
    }
  
    let node: Node<T> = this;
    while (node.parent !== null && node === node.parent.left) {
      node = node.parent;
    }
    return node.parent;
  }

  reverse() {
    return new RNode<T>(this);
  }

}

class RNode<T> {

  get value() {
    return this._node.value;
  }

  set value(newVal: T) {
    this._node.value = newVal;
  }

  constructor(public _node: Node<T>) {

  }

  next() {
    return this._node.prev();
  }

  prev() {
    return this._node.next();
  }

  *[Symbol.iterator]() {
    let node: Node<T> | null = this._node;
    do {
      yield node.value;
      node = node.prev();
    } while (node !== null);
  }

  reverse() {
    return this._node;
  }

}

class NodeRange<T> implements CollectionRange<T> {

  constructor(public min: Node<T> | null, public max: Node<T> | null, public _reversed = false) {
    
  }

  reverse(): CollectionRange<T> {
    return new NodeRange<T>(this.min, this.max, !this._reversed);
  }

  get size() {
    // FIXME can be optimised
    return [...this].length;
  }

  *values() {
    for (const node of this) {
      yield node.value;
    }
  }

  *[Symbol.iterator]() {
    if (!this._reversed) {
      let node = this.min, max = this.max;
      while (node !== null) {
        yield node;
        if (node === max){
          break;
        }
        node = node.next();
      }
    } else {
      let node = this.max, min = this.min;
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
  let rightNode = node.right!;
  node.right    = rightNode.left;

  if (rightNode.left) rightNode.left.parent = node;

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
  let leftNode = node.left!;
  node.left = leftNode.right;
  if (node.left) node.left.parent = node;

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

export class AVLTree<T, K = T> implements KeyedCollection<T, K> {

  _comparator: (a: K, b: K) => number;

  constructor(
        public lessThan: (a: K, b: K) => boolean = lesser
      , public _getKey: (val: T) => K = val => val as any
      , public isEqual: (a: T, b: T) => boolean = (a, b) => a === b
      , public _allowDuplicates = true) {
    this._comparator = liftLesser(lessThan);
  }

  _size = 0;
  _root: Node<T> | null = null;

  clear() {
    this._root = null;
    this._size = 0;
  }

  get size() {
    return this._size;
  }

  getAddHint(value: T): AddHint<T> {

    const compare = this._comparator
        , getKey = this._getKey
        , key = getKey(value); 
    let node    = this._root
      , parent  = null
      , cmp;

    if (!this._allowDuplicates) {
      while (node !== null) {
        cmp = compare(key, getKey(node.value));
        parent = node;
        if      (cmp === 0) return [false, node];
        else if (cmp < 0)   node = node.left;
        else                node = node.right;
      }
    } else {
      while (node !== null) {
        cmp = compare(key, getKey(node.value));
        parent = node;
        if      (cmp <= 0)  node = node.left; //return null;
        else                node = node.right;
      }
    }

    return [true, parent, cmp];
  }

  add(value: T, hint?: AddHint<T>): [boolean, Cursor<T>] {
    if (this._root === null) {
      this._root = new Node<T>(value);
      this._size++;
      return [true, this._root];
    }

    const getKey = this._getKey;
    if (hint === undefined) {
      hint = this.getAddHint(value);
    }

    if (hint[0] === false) {
      return hint as [boolean, Node<T>];
    }

    let parent = hint[1], cmp = hint[2]!;
    
    const compare = this._comparator;
    let newNode = new Node<T>(value, parent);
    let newRoot;
    if (cmp <= 0) parent!.left  = newNode;
    else          parent!.right = newNode;

    while (parent !== null) {
      cmp = compare(getKey(parent.value), getKey(value));
      if (cmp < 0) parent.balance -= 1;
      else         parent.balance += 1;

      if        (parent.balance === 0) break;
      else if   (parent.balance < -1) {
        // inlined
        //let newRoot = rightBalance(parent);
        if (parent.right!.balance === 1) rotateRight(parent.right!);
        newRoot = rotateLeft(parent);

        if (parent === this._root) this._root = newRoot;
        break;
      } else if (parent.balance > 1) {
        // inlined
        // let newRoot = leftBalance(parent);
        if (parent.left!.balance === -1) rotateLeft(parent.left!);
        newRoot = rotateRight(parent);

        if (parent === this._root) this._root = newRoot;
        break;
      }
      parent = parent.parent;
    }

    this._size++;
    return [true, newNode];
  }

  has(element: T): boolean {
    for (const node of this.equalKeys(this._getKey(element))) {
      if (this.isEqual(node.value, element)) {
        return true;
      }
    }
    return false;
  }

  hasKey(key: K): boolean {
    return this.findKey(key) !== null;
  }

  // find(val: T): Node<T> | null {
    // let node = this._root;
    // const compare = this._comparator
    //     , getKey = this._getKey
    // , key = getKey(val);
    // const locateEqual = (node: Node<T> | null): Node<T> | null => {
    //   if (node === null) {
    //     return null;
    //   }
    //   if (this.isEqual(node.value, val)) {
    //     return node;
    //   }
    //   return locateEqual(node.left) || locateEqual(node.right);
    // }
    // while (node !== null) {
    //   const cmp = compare(getKey(node.value), key);
    //   if      (cmp > 0) node = node.left;
    //   else if (cmp < 0) node = node.right;
    //   else return       locateEqual(node);
    // }
    // return null;
  // }

  /**
   * Always returns the topmost node that satisfies the given constraints.
   */
  findKey(key: K): Node<T> | null {
    let node = this._root;
    const compare = this._comparator;
    const getKey = this._getKey;
    while (node !== null) {
      const cmp = compare(key, getKey(node.value));
      if (cmp < 0)   node = node.left;
      else if (cmp > 0) node = node.right;
      else return node;
    }
    return null;
  }

  _findMin (key: K, node = this.findKey(key)): Node<T> | null {
    if (node === null)
      return null;
    const cmp = this._comparator(key, this._getKey(node.value));
    if (cmp < 0) return this._findMin(key, node.left);
    if (cmp > 0) return this._findMin(key, node.right);
    return this._findMin(key, node.left) || node;
  }

  _findMax (key: K, node = this.findKey(key)): Node<T> | null {
    if (node === null)
      return null;
    const cmp = this._comparator(key, this._getKey(node.value));
    if (cmp < 0)
      return this._findMax(key, node.left);
    if (cmp > 0)
      return this._findMax(key, node.right);
    return this._findMax(key, node.right) || node;
  }

  _nodesWithKey(key: K): Node<T>[] {

    let top = this.findKey(key)
        , min = this._findMin(key, top)
        , max = this._findMax(key, top);

    let out = [], node = min;
    while (node !== null) {
      out.push(node);
      if (node === max)
        break;
      node = node.next();
    }

    return out;
  }

  equalKeys(key: K): NodeRange<T> {
    const top = this.findKey(key)
        , min = this._findMin(key, top)
        , max = this._findMax(key, top);
    return new NodeRange<T>(min, max);
  }

  lowerKey(key: K): Node<T> | null {
    const compare = this._comparator;
    const getKey = this._getKey;
    let node = this._root;
    while (node !== null && compare(getKey(node.value), key) > 0) {
      if (node.left !== null) {
        node = node.left;
      } else { 
        node = null;
        break;
      }
    }
    if (node !== null && compare(getKey(node.value), key) === 0 && node.right !== null) {
      node = node.right;
      while (node.left !== null) node = node.left;
    }
    return node;
  }

  upperKey(key: K): Node<T> | null {
    const compare = this._comparator;
    const getKey = this._getKey;
    let node = this._root;
    while (node !== null && compare(getKey(node.value), key) < 0) {
      if (node.right !== null) {
        node = node.right;
      } else { 
        node = null;
        break;
      }
    }
    if (node !== null && compare(getKey(node.value), key) === 0) {
      node = node.left;
      if (node !== null) {
        while (node.right !== null) node = node.right;
      }
    }

    return node;
  }

  toRange() {
    return new NodeRange(this.begin(), this.end());
  }

  begin(): Node<T> | null {
    if (this._root === null) return null;
    let node = this._root;
    while (node.left !== null) node = node.left;
    return node;
  }

  end(): Node<T> | null {
    if (this._root === null) return null;
    let node = this._root;
    while (node.right !== null) node = node.right;
    return node;
  }

  *[Symbol.iterator]() {
    // TODO issue #12
    if (this._root === null) return;
    for (const value of this.begin()![Symbol.iterator]()) {
      yield value;
    }
  }

  deleteKey(key: K) {
    let deleteCount = 0, nodes = this._nodesWithKey(key);
    for (const node of nodes) {
      this.deleteAt(node);
      ++deleteCount;
    }
    return deleteCount;
  }

  deleteAll(value: T) {
    let deleteCount = 0, nodes = this._nodesWithKey(this._getKey(value));
    for (const node of nodes) {
      if (this.isEqual(node.value, value)) {
        this.deleteAt(node);
        ++deleteCount;
      }
    }
    return deleteCount;
  }

  *getNodes(): any {
    // TODO issue #12
  }

  delete(el: T): boolean {
    for (const node of this.equalKeys(this._getKey(el))) {
      if (this.isEqual(node.value, el)) {
        this.deleteAt(node);
        return true;
      }
    }
    return false;
  }

  deleteAt(node: Node<T>) {
    let returnValue = node.value;
    let max, min;

    if (node.left) {
      max = node.left;

      while (max.left || max.right) {
        while (max.right) max = max.right;

        node.value = max.value;
        if (max.left) {
          node = max;
          max = max.left;
        }
      }

      node.value  = max.value;
      node = max;
    }

    if (node.right) {
      min = node.right;

      while (min.left || min.right) {
        while (min.left) min = min.left;

        node.value  = min.value;
        if (min.right) {
          node = min;
          min = min.right;
        }
      }

      node.value  = min.value;
      node = min;
    }

    let parent = node.parent;
    let pp     = node;
    let newRoot;

    while (parent) {
      if (parent.left === pp) parent.balance -= 1;
      else                    parent.balance += 1;

      if (parent.balance < -1) {
        // inlined
        //let newRoot = rightBalance(parent);
        if (parent.right!.balance === 1) rotateRight(parent.right!);
        newRoot = rotateLeft(parent);

        if (parent === this._root) this._root = newRoot;
        parent = newRoot;
      } else if (parent.balance > 1) {
        // inlined
        // let newRoot = leftBalance(parent);
        if (parent.left!.balance === -1) rotateLeft(parent.left!);
        newRoot = rotateRight(parent);

        if (parent === this._root) this._root = newRoot;
        parent = newRoot;
      }

      if (parent.balance === -1 || parent.balance === 1) break;

      pp     = parent;
      parent = parent.parent;
    }

    if (node.parent) {
      if (node.parent.left === node) node.parent.left  = null;
      else                           node.parent.right = null;
    }

    if (node === this._root) this._root = null;

    this._size--;
    return returnValue;
  }

}

export default AVLTree;

