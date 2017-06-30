
import Queue from "./queue"
import { Grid, TreeNode } from "../interfaces"
import FlexGrid from "./grid/flex"
import gridToString from "./gridToString"
import copyGrid from "./copyGrid"
import mergeChar from "merge-char"

function push(arr, el) {
  const newArr = arr.slice()
  newArr.push(el)
  return newArr
}

function max(...els: number[]): number {
  let res = -Infinity
  for (const el of els)
    res = Math.max(res, el)
  return res
}

function flattenTree<T>(tree: TreeNode<T>, yieldAt = (node, parents) => node.getChildren().length-1) {
  function* flatten(node: TreeNode<T>, parents = []) {
    const children = node.getChildren()
    if (children.length === 0)
      yield [node, parents]
    else {
      const yieldIdx = yieldAt(node, parents)
      for (let i = 0; i < children.length; ++i) {
        if (yieldIdx === i)
          yield [node, parents]
        yield* flatten(children[i], push(parents, children[i]))
      }
    }
  }
  return flatten(tree)
}

class MergeGrid extends FlexGrid<string> {
  set([x,y]: [number,number], val: string) {
    const c = super.get([x,y])
    const merged = mergeChar(val, c)
    if (merged === null)
      super.set([x,y],val)
    else
      super.set([x,y], merged)
  }
}

function renderTree<T>(out: Grid<string>, root: TreeNode<T>) {
  
  const mapping = new Map<TreeNode<T>, [number,number]>()

  function renderValue(val: T) {
    return val.toString()
  }

  function writeString([x,y]: [number,number], str: string) {
    for (let i = 0; i < str.length; ++i)
      out.set([x+i,y],str[i])
  }

  const order = [...flattenTree(root, (node, parents) => Math.floor(node.getChildren().length / 2))]
  const maxNodeWidth = max(...order.map(([node, parents]) => renderValue(node.getValue()).length))
  console.log(maxNodeWidth)
  let i = 0;
  for (const [node, parents] of order) {
    mapping.set(node, [i*maxNodeWidth, parents.length*2])
    writeString([i*maxNodeWidth, parents.length*2], renderValue(node.getValue()))
    ++i;
  }

  const lines = new MergeGrid()

  function renderLines(node: TreeNode<T>) {
    const children = node.getChildren()
    const [sx, sy] = mapping.get(node)
    for (const child of children) {
      const [dx, dy] = mapping.get(child)
      if (sx < dx) 
        lines.set([dx, dy-1], '┐')
      else if (sx === dx)
        lines.set([dx, dy-1], '│')
      else 
        lines.set([dx, dy-1], '┌')
      renderLines(child)
    }
    if (children.length > 0) {
      lines.set([sx,sy+1], '╵')
      for (let x = mapping.get(children[0])[0]+1; x < mapping.get(children[children.length-1])[0]; ++x)
        lines.set([x, sy+1], '─')
    }
  }

  renderLines(root)

  copyGrid(lines, out)
}

export function printTree<T>(root: TreeNode<T>) {
  const grid = new FlexGrid<string>()
  renderTree(grid, root)
  console.log(gridToString(grid))
}

export default printTree

