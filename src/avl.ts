
import "source-map-support/register"
import { lesser, ViewBase } from "./util"

// function createNode (parent, left, right, height, value, data) {
//   return { parent, left, right, balance: height, value, data };
// }

class Node<T> {

  balance: number = 0;
  left: Node<T> = null;
  right: Node<T> = null;
  data?: any;

  constructor(public value: T, public parent: Node<T> = null) {

  }

  *[Symbol.iterator]() {
    let node: Node<T> = this;
    do {
      yield node.value;
      node = node.next();
    } while (node !== null);
  }

  next(): Node<T> {
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

  prev(): Node<T> {
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
    let node: Node<T> = this._node;
    do {
      yield node.value;
      node = node.prev();
    } while (node !== null);
  }

  reverse() {
    return this._node;
  }

}

class NodeRange<T> extends ViewBase<T> {

  constructor(public min: Node<T>, public max: Node<T>, public _reversed = false) {
    super();
  }

  reverse() {
    return new NodeRange<T>(this.min, this.max, !this._reversed);
  }

  *[Symbol.iterator]() {
    if (!this._reversed) {
      let node: Node<T> = this.min, max = this.max;
      while (node !== null) {
        yield node.value;
        if (node === max)
          break;
        node = node.next();
      }
    } else {
      let node: Node<T> = this.max, min = this.min;
      while (node !== null) {
        yield node.value;
        node = node.prev();
        if (node === min)
          break;
      }
    }
  }

}

interface AVLIteratorResult<T> extends IteratorResult<T> {
  _node: Node<T>;
}

function rotateLeft<T>(node: Node<T>) {
  var rightNode = node.right;
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
  var leftNode = node.left;
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

export class AVLTree<T, K = T> {

  constructor(
    public _comparator: (a: K, b: K) => number
    , public _getKey: (val: T) => K = val => val
    , public isEqual: (a: T, b: T) => boolean = (a, b) => a === b
    , public _allowDuplicates = true) {

  }
  
  lessThan: (a: T, b: T) => boolean;

  _size = 0;
  _root: Node<T> = null;

  clear() {
    this._root = null;
    this._size = 0;
  }

  get size () {
    return this._size;
  }

  addHint (key: K) {
    
    const compare = this._comparator
        , getKey = this._getKey;
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

    return [true, cmp, parent];
  }

  add (value: T, hint?) {
    if (!this._root) {
      this._root = new Node<T>(value);
      this._size++;
      return [true, this._root];
    }

    const getKey = this._getKey;
    if (hint === undefined) {
      hint = this.addHint(getKey(value));
    }

    if (!hint[0]) {
      return hint[1];
    }

    let parent = hint[2], cmp = hint[1];
    
    const compare = this._comparator;
    var newNode = new Node<T>(value, parent);
    var newRoot;
    if (cmp <= 0) parent.left  = newNode;
    else         parent.right = newNode;

    while (parent) {
      cmp = compare(getKey(parent.value), getKey(value));
      if (cmp < 0) parent.balance -= 1;
      else         parent.balance += 1;

      if        (parent.balance === 0) break;
      else if   (parent.balance < -1) {
        // inlined
        //var newRoot = rightBalance(parent);
        if (parent.right.balance === 1) rotateRight(parent.right);
        newRoot = rotateLeft(parent);

        if (parent === this._root) this._root = newRoot;
        break;
      } else if (parent.balance > 1) {
        // inlined
        // var newRoot = leftBalance(parent);
        if (parent.left.balance === -1) rotateLeft(parent.left);
        newRoot = rotateRight(parent);

        if (parent === this._root) this._root = newRoot;
        break;
      }
      parent = parent.parent;
    }

    this._size++;
    return [true, newNode];
  }

  has (val: T) {
    return this.find(val) !== null;
  }


  hasKey(key: K) {
    return this.findKey(key) !== null;
  }

  find (val: T): Node<T> {
    let node = this._root;
    const compare = this._comparator
        , getKey = this._getKey
    , key = getKey(val);
    const locateEqual = (node: Node<T>) => {
      if (node === null)
        return null;
      if (this.isEqual(node.value, val))
        return node;
      return locateEqual(node.left) || locateEqual(node.right);
    }
    while (node !== null) {
      const cmp = compare(getKey(node.value), key);
      if (cmp > 0)   node = node.left;
      else if (cmp < 0) node = node.right;
      else return locateEqual(node);
    }
    return null;
  }

  /**
   * Always returns the topmost node that satisfies the given constraints.
   */
  findKey (key: K): Node<T> {
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

  _findMin (key: K, node = this.findKey(key)) {
    if (node === null)
      return null;
    const cmp = this._comparator(key, this._getKey(node.value));
    if (cmp < 0)
      return this._findMin(key, node.left);
    if (cmp > 0)
      return this._findMin(key, node.right);
    return this._findMin(key, node.left) || node;
  }

  _findMax (key: K, node = this.findKey(key)) {
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

  equal(val: T) {
    return this.equalKeys(this._getKey(val)).filter(oth => this.isEqual(oth, val));
  }

  lower(key: K): Node<T> {

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
    if (node !== null && compare(getKey(node.value), key) === 0) {
      node = node.right;
      while (node.left !== null) node = node.left;
    }
    return node;
  }

  upper(key: K): Node<T> {

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

  begin(): Node<T> {
    if (this._root === null) return null;
    let node = this._root;
    while (node.left !== null) node = node.left;
    return node;
  }

  end(): Node<T> {
    if (this._root === null) return null;
    let node = this._root;
    while (node.right !== null) node = node.right;
    return node;
  }

  *[Symbol.iterator]() {
    if (this._size === 0) {
      return;
    }
    yield* this.begin();
  }

  deleteKey (key: K) {
    let deleteCount = 0, nodes = this._nodesWithKey(key);
    for (const node of nodes) {
      this.deleteAt(node);
      ++deleteCount;
    }
    return deleteCount;
  }

  delete (value: T) {
    let deleteCount = 0, nodes = this._nodesWithKey(this._getKey(value));
    for (const node of nodes) {
      if (this.isEqual(node.value, value)) {
        this.deleteAt(node);
        ++deleteCount;
      }
    }
    return deleteCount;
  }

  deleteAt(node) {
    var returnValue = node.value;
    var max, min;

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

    var parent = node.parent;
    var pp     = node;
    var newRoot;

    while (parent) {
      if (parent.left === pp) parent.balance -= 1;
      else                    parent.balance += 1;

      if        (parent.balance < -1) {
        // inlined
        //var newRoot = rightBalance(parent);
        if (parent.right.balance === 1) rotateRight(parent.right);
        newRoot = rotateLeft(parent);

        if (parent === this._root) this._root = newRoot;
        parent = newRoot;
      } else if (parent.balance > 1) {
        // inlined
        // var newRoot = leftBalance(parent);
        if (parent.left.balance === -1) rotateLeft(parent.left);
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

