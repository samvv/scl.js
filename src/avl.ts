
import "source-map-support/register"
import { lesser } from "./util"

// function createNode (parent, left, right, height, value, data) {
//   return { parent, left, right, balance: height, value, data };
// }

class Node<T> {

  balance: number = 0;
  left: Node<T> = null;
  right: Node<T> = null;

  constructor(public value: T, public parent: Node<T> = null) {

  }

  [Symbol.iterator]() {
    let curr: Node<T> = this;
    return {
      next() {
        const node = curr;
        if (node === null) {
          return <AVLIteratorResult<T>>{ done: true };
        }
        curr = node.next();
        return { done: false, value: node.value, _node: node };
      }
    }
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

  [Symbol.iterator]() {
    let curr: Node<T> = this._node;
    return {
      next() {
        const node = curr;
        if (node === null) {
          return <AVLIteratorResult<T>>{ done: true };
        }
        curr = node.prev();
        return { done: false, value: node.value, _node: node };
      }
    }
  }

  reverse() {
    return this._node;
  }

}

class NodeRange<T> {

  constructor(public min: Node<T>, public max: Node<T>) {

  }

  [Symbol.iterator]() {
    let curr: Node<T> = this.min;
    return {
      next: () => {
        const node = curr;
        if (node === null) {
          return <AVLIteratorResult<T>>{ done: true };
        }
        if (node === this.max) {
          curr = null; 
        } else {
          curr = node.next();
        }
        return { done: false, value: node.value, _node: node };
      }
    }   
  }

}

class RNodeRange<T> {

  constructor(public _range: NodeRange<T>) {

  }

  [Symbol.iterator]() {
    let curr: Node<T> = this._range.max;
    return {
      next: () => {
        const node = curr;
        if (node === null || node === this._range.min) {
          return <AVLIteratorResult<T>>{ done: true };
        }
        curr = node.prev();
        return { done: false, value: node.value, _node: node };
      }
    }   
  }

  reverse() {
    return this._range;
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

  constructor (lessThan = lesser, noDuplicates = false) {
    this.lessThan = lessThan;
    this._comparator = (a: T, b: T) => {
      if (lessThan(a, b)) return -1;
      if (lessThan(b, a)) return 1;
      return 0;
    }

    this._noDuplicates = !!noDuplicates;
  }
  
  lessThan: (a: T, b: T) => boolean;

  _size = 0;
  _root: Node<T> = null;
  _comparator: (a: T, b: T) => number;
  _noDuplicates: boolean;

  /**
   * Clear the tree
   * @return {AVLTree}
   */
  clear() {
    this._root = null;
    this._size = 0;
  }

  /**
   * Number of nodes
   * @return {number}
   */
  get size () {
    return this._size;
  }

  /**
   * Insert a node into the tree
   * @param  {Key} key
   * @param  {Value} [data]
   * @return {?Node}
   */
  insert (value) {
    if (!this._root) {
      this._root = new Node<T>(value);
      this._size++;
      return this._root;
    }

    var compare = this._comparator;
    var node    = this._root;
    var parent  = null;
    var cmp     = 0;

    if (this._noDuplicates) {
      while (node) {
        cmp = compare(value, node.value);
        parent = node;
        if      (cmp === 0) return null;
        else if (cmp < 0)   node = node.left;
        else                node = node.right;
      }
    } else {
      while (node) {
        cmp = compare(value, node.value);
        parent = node;
        if      (cmp <= 0)  node = node.left; //return null;
        else                node = node.right;
      }
    }

    var newNode = new Node<T>(value, parent);
    var newRoot;
    if (cmp <= 0) parent.left  = newNode;
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
    return newNode;
  }

  /**
   * Whether the tree contains a node with the given value
   * @param  {Key} value
   * @return {boolean} true/false
   */
  contains (value) {
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


  /**
   * @param  {forEachCallback} callback
   * @return {AVLTree}
   */
  //forEach(callback) {
    //var current = this._root;
    //var s = [], done = false, i = 0;
    
    //while (!done) {
      //// Reach the left most Node of the current Node
      //if (current) {
        //// Place pointer to a tree node on the stack
        //// before traversing the node's left subtree
        //s.push(current);
        //current = current.left;
      //} else {
        //// BackTrack from the empty subtree and visit the Node
        //// at the top of the stack; however, if the stack is
        //// empty you are done
        //if (s.length > 0) {
          //current = s.pop();
          //callback(current, i++);

          //// We have visited the node and its left
          //// subtree. Now, it's right subtree's turn
          //current = current.right;
        //} else done = true;
      //}
    //}
    //return this;
  //}

  equal(val: T): NodeRange<T> {

    const lt = this.lessThan;
    const equal = (a, b) => !lt(a ,b) && !lt(b, a);

    let min = (function findMin(node) {
      if (lt(node.value, val)) {
        if (node.right !== null)
          return findMin(node.right);
        return null;
      }
      if (lt(val, node.value)) {
        if (node.left !== null)
          return findMin(node.left);
        return null;
      }
      if (node.left !== null) {
        const res = findMin(node.left);
        if (res !== null) {
          return res;
        }
      }
      if (node.right !== null) {
        const res = findMin(node.right);
        if (res !== null) {
          return res;
        }
      }
      return node;
    })(this._root);

    let max = (function findMax(node) {
      if (lt(node.value, val)) {
        if (node.right !== null)
          return findMax(node.right);
        return null;
      }
      if (lt(val, node.value)) {
        if (node.left !== null)
          return findMax(node.left);
        return null;
      }
      if (node.right !== null) {
        const res = findMax(node.right);
        if (res !== null) {
          return res;
        }
      }
      if (node.left !== null) {
        const res = findMax(node.left);
        if (res !== null) {
          return res;
        }
      }
      return node;
    })(this._root);

    return new NodeRange<T>(min, max);
  }

  lower(val: T): Node<T> {

    const lt = this.lessThan;
    let node = this._root;
    while (lt(val, node.value) && !lt(node.value, val)) { 
      if (node.left !== null) {
        node = node.left;
      } else { 
        node = null;
        break;
      }
    }
    if (node !== null && !lt(val, node.value)) {
      node = node.right;
      while (node.left !== null) node = node.left;
    }
    return node;
  }

  upper(val: T): Node<T> {

    const lt = this.lessThan;
    let node = this._root;
    while (lt(node.value, val) && !lt(val, node.value)) {
      if (node.right !== null) {
        node = node.right;
      } else { 
        node = null;
        break;
      }
    }
    if (node !== null && !lt(node.value, val)) {
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

  [Symbol.iterator]() {
    if (this._size === 0) {
      return { next() { return { done: true } } };
    }
    return this.begin()[Symbol.iterator]();
  }

  /**
   * Removes the node from the tree. If not found, returns null.
   * @param  {Key} value
   * @return {?Node}
   */
  remove (value) {
    if (!this._root) return null;
    var node = this._root;
    var compare = this._comparator;
    var cmp = 0;

    while (node) {
      cmp = compare(value, node.value);
      if      (cmp === 0) break;
      else if (cmp < 0)   node = node.left;
      else                node = node.right;
    }
    if (!node) return null;

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


