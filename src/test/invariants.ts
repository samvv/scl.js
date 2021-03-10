
import { AVLTreeIndex, Node } from "../AVLTreeIndex";
import { Collection } from "../interfaces";
import { RBTreeIndex, RBNode, RBColor } from "../RBTreeIndex";

export function checkAVLTreeInvariants<T, K>(this: AVLTreeIndex<T, K>) {

  const visit = (node: Node<T> | null): number => {

    if (node === null) {
      return 0;
    }

    // This logic checks the binary tree property that nodes on the left should be
    // smaller and nodes on the right should be larger. If duplicate keys are
    // allowed, this restriction is loosened to allow keys that are equal.
    const key = this.getKey(node.value);
    if (node.left !== null) {
      const leftKey =  this.getKey(node.left.value);
      if (!this.allowDuplicates && !this.compareKeys(key, leftKey) && !this.compareKeys(leftKey, key)) {
        throw new Error(`Child on the left has the same value of its parent ${node.value} while duplicates are not allowed`)
      }
      if (!this.compareKeys(leftKey, key)) {
        throw new Error(`Child on the left of ${node.value} is not strictly larger than its parent.`)
      }
    }
    if (node.right !== null) {
      const rightKey = this.getKey(node.right.value);
      if (!this.allowDuplicates && !this.compareKeys(key, rightKey) && !this.compareKeys(rightKey, key)) {
        throw new Error(`Child on the right has the same value of its parent ${node.value} while duplicates are not allowed`)
      }
      if (!this.compareKeys(key, rightKey)) {
        throw new Error(`Child on the left of ${node.value} is not strictly smaller than its parent.`)
      }
    }

    // The basic property of an AVL tree is that it is (almost) perfectly
    // balanced. We check this by taking the different of the heights of the
    // two child nodes. If this delta is larger than 1, we have a problem.
    const leftHeight = visit(node.left);
    const rightHeight = visit(node.right);
    if (Math.abs(leftHeight - rightHeight) > 1) {
      throw new Error(`Node with value ${node.value} has children with a height difference larger than 1`)
    }

    // Return the maximum height of this subtree for use by the above check in
    // a next iteration.
    return Math.max(leftHeight, rightHeight);
  }

  visit(this.rootNode as Node<T> | null);
}

export function checkRBTreeInvariants<T, K>(this: RBTreeIndex<T, K>): void {

  const visit = (node: RBNode<T> | null): number => {

    if (node === null) {
      return 0;
    }

    // This logic checks the binary tree property that nodes on the left should be
    // smaller and nodes on the right should be larger. If duplicate keys are
    // allowed, this restriction is loosened to allow keys that are equal.
    const key = this.getKey(node.value);
    if (node.left !== null) {
      const leftKey =  this.getKey(node.left.value);
      if (!this.allowDuplicates && !this.compareKeys(key, leftKey) && !this.compareKeys(leftKey, key)) {
        throw new Error(`Child on the left has the same value of its parent ${node.value} while duplicates are not allowed`)
      }
      if (!this.compareKeys(leftKey, key)) {
        throw new Error(`Child on the left of ${node.value} is not strictly larger than its parent.`)
      }
    }
    if (node.right !== null) {
      const rightKey = this.getKey(node.right.value);
      if (!this.allowDuplicates && !this.compareKeys(key, rightKey) && !this.compareKeys(rightKey, key)) {
        throw new Error(`Child on the right has the same value of its parent ${node.value} while duplicates are not allowed`)
      }
      if (!this.compareKeys(key, rightKey)) {
        throw new Error(`Child on the left of ${node.value} is not strictly smaller than its parent.`)
      }
    }

    const left = node.left as RBNode<T>;
    const right = node.right as RBNode<T>;

    // Here we check the invariant that two red nodes can never be directly
    // connected to each other. Because we use recursion and therefore the
    // child nodes will be checked in the next iteration, we can just compare
    // `node` with both of its children.
    if (node.color === RBColor.Red) {
      if (left !== null && left.color === RBColor.Red) {
        throw new Error(`Node on the left of node with value ${node.value} is red while the parent is also red.`)
      }
      if (right !== null && right.color === RBColor.Red) {
        throw new Error(`Node on the right of node with value ${node.value} is red while the parent is also red.`)
      }
    }

    // Here we check the invariant that all paths to leaf nodes should have the
    // same amount of black nodes. We make use of the function's return value
    // to calculate the amount of black nodes in the children and compare the
    // results.
    const blackCountLeft = node.left !== null ? visit(left) : 0;
    const blackCountRight = node.right !== null ? visit(right) : 0;
    if (blackCountLeft !== blackCountRight) {
      throw new Error(`The amount of black nodes on the left of node with value ${node.value} does not equal the amount of black nodes on the right`)
    }

    // Return the amount of black nodes leading to this node for use in the above check.
    return blackCountLeft + node.color === RBColor.Black ? 1 : 0;
  }

  visit(this.rootNode as RBNode<T> | null);
}

export function checkInvariants<T>(collection: Collection<T>) {
  if (collection instanceof RBTreeIndex) {
    checkRBTreeInvariants.call(collection);
    return;
  }
  if (collection instanceof AVLTreeIndex) {
    checkAVLTreeInvariants.call(collection);
  }
}

