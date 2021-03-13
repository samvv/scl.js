
import { AVLTreeIndex, AVLNode } from "../AVLTreeIndex";
import { BST, BSNode } from "../BSTreeIndex";
import { Collection } from "../interfaces";
import { RBTreeIndex, RBNode, RBColor } from "../RBTreeIndex";
import { ResolveAction } from "../util";

function checkBinaryTreeNode<T, K>(tree: BST<T, K>, node: BSNode<T>) {
  const key = tree.getKey(node.value);
  if (node.left !== null) {
    const leftKey =  tree.getKey(node.left.value);
    const keysEqual = tree.areKeysEqual(key, leftKey);
    if (keysEqual) {
      if (tree.onDuplicateKeys !== ResolveAction.Insert) {
        throw new Error(`Child on the left has the same value of its parent ${node.value} while duplicates are not allowed`)
      }
    } else if (!tree.isKeyLessThan(leftKey, key)) {
      throw new Error(`Child on the left of ${node.value} is not strictly smaller than its parent.`)
    }
  }
  if (node.right !== null) {
    const rightKey = tree.getKey(node.right.value);
    const keysEqual = tree.areKeysEqual(key, rightKey);
    if (keysEqual) {
      if (tree.onDuplicateKeys !== ResolveAction.Insert) {
        throw new Error(`Child on the right has the same value of its parent ${node.value} while duplicates are not allowed`)
      }
    } else if (!tree.isKeyLessThan(key, rightKey)) {
      throw new Error(`Child on the right of ${node.value} is not strictly larger than its parent.`)
    }
  }
}

export function checkAVLTreeInvariants<T, K>(this: AVLTreeIndex<T, K>) {

  const visit = (node: AVLNode<T> | null): number => {

    if (node === null) {
      return 0;
    }

    checkBinaryTreeNode(this, node);

    // The basic property of an AVL tree is that it is (almost) perfectly
    // balanced. We check this by taking the different of the heights of the
    // two child nodes. If this delta is larger than 1, we have a problem.
    const leftHeight = visit(node.left);
    const rightHeight = visit(node.right);
    if ((rightHeight - leftHeight) !== node.balance) {
      throw new Error(`Node with value ${node.value} has a balance of ${node.balance} while it should be ${rightHeight - leftHeight}`)
    }

    // Return the maximum height of this subtree for use by the above check in
    // a next iteration.
    return Math.max(leftHeight, rightHeight) + 1;
  }

  visit(this.root as AVLNode<T> | null);
}

export function checkRBTreeInvariants<T, K>(this: RBTreeIndex<T, K>): void {

  const visit = (node: RBNode<T> | null): number => {

    if (node === null) {
      return 0;
    }

    checkBinaryTreeNode(this, node);

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

  visit(this.root as RBNode<T> | null);
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

