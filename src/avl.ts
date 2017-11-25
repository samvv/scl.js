
import "source-map-support/register"
import { lesser } from "./util"

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

class NodeRange<T> {

  constructor(public min: Node<T>, public max: Node<T>, public _reversed = false) {

  }

  reverse() {
    return new NodeRange(min, max, !this._reversed);
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

// function leftBalance (node) {
//   if (node.left.balance === -1) rotateLeft(node.left);
//   return rotateRight(node);
// }

// function rightBalance (node) {
//   if (node.right.balance === 1) rotateRight(node.right);
//   return rotateLeft(node);
// }

export class AVLTree<T> {

  constructor(public _comparator, public _allowDuplicates = true) {

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

  addHint (value: T) {
    
    const compare = this._comparator;
    let node    = this._root
      , parent  = null
      , cmp;

    if (!this._allowDuplicates) {
      while (node !== null) {
        cmp = compare(node.value, value);
        parent = node;
        if      (cmp === 0) return [false, cmp, parent];
        else if (cmp > 0)   node = node.left;
        else                node = node.right;
      }
    } else {
      while (node !== null) {
        cmp = compare(node.value, value);
        parent = node;
        if      (cmp >= 0)  node = node.left; //return null;
        else                node = node.right;
      }
    }

    return [true, cmp, parent];
  }

  add (value: T, hint?: Node<T>) {
    if (!this._root) {
      this._root = new Node<T>(value);
      this._size++;
      return [true, this._root];
    }

    if (hint === undefined) {
      hint = this.addHint(value);
    }

    let [shouldAdd, cmp, parent] = hint;

    if (!shouldAdd) {
      return;
    }
    
    const compare = this._comparator;
    var newNode = new Node<T>(value, parent);
    var newRoot;
    if (cmp >= 0) parent.left  = newNode;
    else         parent.right = newNode;

    while (parent) {
      cmp = compare(parent.value, value);
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

  has (value) {
    if (this._root)  {
      var node       = this._root;
      var comparator = this._comparator;
      while (node)  {
        var cmp = comparator(value, node.value);
        if      (cmp === 0) return true;
        else if (cmp < 0)   node = node.left;
        else                node = node.right;
      }
    }
    return false;
  }

  find<R = T>(val: R): Node<T> {
    let node = this._root;
    const compare = this._comparator;
    while (node !== null) {
      const cmp = compare(node.value, val);
      if (cmp > 0)   node = node.left;
      else if (cmp < 0) node = node.right;
      else return node;
    }
    return null;
  }

  equal(val: T): NodeRange<T> {

    const compare = this._comparator;

    let min = (function findMin(node) {
      if (node === null) 
        return null;
      const cmp = compare(node.value, val);
      if (cmp < 0) {
        return findMin(node.right);
      }
      if (cmp > 0) {
        return findMin(node.left);
      }
      const res1 = findMin(node.left);
      if (res1 !== null) {
        return res1;
      }
      const res2 = findMin(node.right);
      if (res2 !== null) {
        return res2;
      }
      return node;
    })(this._root);

    let max = (function findMax(node) {
      if (node === null) 
        return null;
      const cmp = compare(node.value, val);
      if (cmp < 0) {
        return findMax(node.right);
      }
      if (cmp > 0) {
        return findMax(node.left);
      }
      const res1 = findMax(node.right);
      if (res1 !== null) {
        return res1;
      }
      const res2 = findMax(node.left);
      if (res2 !== null) {
        return res2;
      }
      return node;
    })(this._root);

    return new NodeRange<T>(min, max);
  }

  lower(val: T): Node<T> {

    const compare = this._comparator;
    let node = this._root;
    while (compare(node.value, val) > 0) { 
      if (node.left !== null) {
        node = node.left;
      } else { 
        node = null;
        break;
      }
    }
    if (node !== null && compare(node.value, val) === 0) {
      node = node.right;
      while (node.left !== null) node = node.left;
    }
    return node;
  }

  upper(val: T): Node<T> {

    const compare = this._comparator;
    let node = this._root;
    while (compare(node.value, val) < 0) {
      if (node.right !== null) {
        node = node.right;
      } else { 
        node = null;
        break;
      }
    }
    if (node !== null && compare(node.value, val) === 0) {
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

  delete (value) {
    const node = this.find(value);
    if (node === null) return null;
    this.deleteAt(node);
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

