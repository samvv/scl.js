
import "source-map-support/register"
import { lesser } from "./util"

// function createNode (parent, left, right, height, value, data) {
//   return { parent, left, right, balance: height, value, data };
// }

interface Node<T> {
  balance: number;
  parent: Node<T>
  left: Node<T>;
  right: Node<T>;
  value: T;
}

function mirror(parent: Node<T>, node: Node<T>) {
  if (parent.left === node) {
    return parent.right;
  } else {
    return parent.left;
  }
}

interface AVLIteratorResult<T> extends IteratorResult<T> {
  _node: Node<T>;
}

function createStack(node) {
  const s = [];
  while (node) {
    s.push(node);
    node = node.parent;
  }
  return s;
}


class AVLIterator<T> implements Iterator<T> {

  constructor(public _avl: AVLTree<T>, public _node: Node<T>, public _stack: Node<T>[] = []) {
      
  }

  next() {
    const node = this._node;
    if (node === null) {
      return <AVLIteratorResult<T>>{ done: true };
    }
    this._node = this._avl._findHigher(node);
    return { done: false, value: node.value, _node: node };
    //if (this._node !== null) {
      //let node = this._node;
      //while (true) { 
        //this._stack.push(node);
        //if (node.left !== null)
          //node = node.left;
        //else
          //break
      //}
      //this._node = node;
    //}
    //if (this._stack.length > 0) {
      //const node = this._stack.pop();
      //this._node = node.right;
      //return { done: false, value: node.value, _node: node };
    //}
    //return <AVLIteratorResult<T>>{ done: true };
  }

  prev() {
    //if (this._node === null) {
      //let node = this._avl._root;
      //while (node.right) node = node.right;
      //this._node = node;
      //return { done: false, value: node.value, _node: node };
    //}
    const node = this._node;
    if (node === null) {
      return <AVLIteratorResult<T>>{ done: true };
    }
    this._node = this._avl._findLower(node);
    return { done: false, value: node.value, _node: node };
  }

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
      this._root = {
        parent: null, left: null, right: null, balance: 0,
        value
      };
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

    var newNode = {
      left: null,
      right: null,
      balance: 0,
      parent, value
    };
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


  /* eslint-disable class-methods-use-this */

  /**
   * Successor node
   * @param  {Node} node
   * @return {?Node}
   */
  next (node) {
    var successor = node;
    if (successor) {
      if (successor.right) {
        successor = successor.right;
        while (successor && successor.left) successor = successor.left;
      } else {
        successor = node.parent;
        while (successor && successor.right === node) {
          node = successor; successor = successor.parent;
        }
      }
    }
    return successor;
  }


  /**
   * Predecessor node
   * @param  {Node} node
   * @return {?Node}
   */
  prev (node) {
    var predecessor = node;
    if (predecessor) {
      if (predecessor.left) {
        predecessor = predecessor.left;
        while (predecessor && predecessor.right) predecessor = predecessor.right;
      } else {
        predecessor = node.parent;
        while (predecessor && predecessor.left === node) {
          node = predecessor;
          predecessor = predecessor.parent;
        }
      }
    }
    return predecessor;
  }

  /**
   * @param  {forEachCallback} callback
   * @return {AVLTree}
   */
  forEach(callback) {
    var current = this._root;
    var s = [], done = false, i = 0;
    
    while (!done) {
      // Reach the left most Node of the current Node
      if (current) {
        // Place pointer to a tree node on the stack
        // before traversing the node's left subtree
        s.push(current);
        current = current.left;
      } else {
        // BackTrack from the empty subtree and visit the Node
        // at the top of the stack; however, if the stack is
        // empty you are done
        if (s.length > 0) {
          current = s.pop();
          callback(current, i++);

          // We have visited the node and its left
          // subtree. Now, it's right subtree's turn
          current = current.right;
        } else done = true;
      }
    }
    return this;
  }


  /**
   * Returns all values in order
   * @return {Array<Key>}
   */
  values () {
    var current = this._root;
    var s = [], r = [], done = false;

    while (!done) {
      if (current) {
        s.push(current);
        current = current.left;
      } else {
        if (s.length > 0) {
          current = s.pop();
          r.push(current.value);
          current = current.right;
        } else done = true;
      }
    }
    return r;
  }


  /**
   * Returns `data` fields of all nodes in order.
   * @return {Array<Value>}
   */
  //values () {
    //var current = this._root;
    //var s = [], r = [], done = false;

    //while (!done) {
      //if (current) {
        //s.push(current);
        //current = current.left;
      //} else {
        //if (s.length > 0) {
          //current = s.pop();
          //r.push(current.data);
          //current = current.right;
        //} else done = true;
      //}
    //}
    //return r;
  //}

  _findHigher(node: Node<T>) {

    if (node.right !== null) {
      node = node.right;
      while (node.left !== null) node = node.left;
      return node;
    }

    while (node.parent !== null && node === node.parent.right) {
      node = node.parent;
    }
    return node.parent;
  }

  _findLower(node: Node<T>) {
    if (node.left !== null) { 
      node = node.left;
      while (node.right !== null) node = node.right;
      return node;
    }

    while (node.parent !== null && node === node.parent.left) {
      node = node.parent;
    }
    return node.parent;
  }

  lower(val: T): AVLIterator<T> {

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
    return new AVLIterator(this, node);
  }

  upper(val: T): AVLIterator<T> {

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

    return new AVLIterator(this, node);
  }

  begin() {
    if (this._root === null) return new AVLIterator(this, null);
    let node = this._root;
    while (node.left !== null) node = node.left;
    return new AVLIterator(this, node);
  }

  end() {
    if (this._root === null) return new AVLIterator(this, null);
    let node = this._root;
    while (node.right !== null) node = node.right;
    return new AVLIterator(this, node);
  }

  [Symbol.iterator]() {
    return this.begin();
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


