
export interface TreeNode<T> {
  getValue(): T
  getChildren(): TreeNode<T>[]
  parent?: TreeNode<T> | null
  rightSibling?: TreeNode<T> | null
  leftSibling?: TreeNode<T> | null
}

