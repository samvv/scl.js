
import { Grid } from "../interfaces"
import ArrayGrid from "./grid"
import FlexGrid from "./grid/flex"
import Queue from "./queue"
import { Vec2 } from "./math"

function push(arr, el) {
  const newArr = arr.slice()
  newArr.push(el)
  return newArr
}

export function gridToString(grid: Grid<string>) {
  let out = ''
  for (let j = 0; j < grid.height; ++j) {
    for (let i = 0; i < grid.width; ++i) {
      const c = grid.get([i,j])
      if (c === undefined || c === '\n')
        out += ' '
      else
        out += c
    }
    if (j !== grid.height-1)
      out += '\n'
  }
  //return trimLineRight(out)
  return out
}

export interface TreeNode<T> {
  getValue(): T
  getChildren(): TreeNode<T>[]
  parent?: TreeNode<T> | null
  rightSibling?: TreeNode<T> | null
  leftSibling?: TreeNode<T> | null
}

export function depthFirstInOrder<T>(tree: TreeNode<T>, proc: (node: TreeNode<T>, parents: TreeNode<T>[]) => void, parents = []) {
  const children = tree.getChildren()
  if (children.length === 0)
    proc(tree, parents)
  else {
    const middle = Math.floor(children.length/2)
    for (let i = 0; i < children.length; ++i) {
      if (i === middle)
        proc(tree, parents)
      depthFirstInOrder(children[i], proc, push(parents, tree))
    }
  }
}

export function depthFirstPreOrder<T>(tree: TreeNode<T>, proc: (node: TreeNode<T>, parents: TreeNode<T>[]) => void, parents = []) {
  const children = tree.getChildren()
  proc(tree, parents)
  for (let i = 0; i < children.length; ++i)
    depthFirstPreOrder(children[i], proc, push(parents, tree))
}

export function depthFirstPostOrder<T>(tree: TreeNode<T>, proc: (node: TreeNode<T>, parents: TreeNode<T>[]) => void, parents = []) {
  const children = tree.getChildren()
  for (let i = 0; i < children.length; ++i)
    depthFirstPostOrder(children[i], proc, push(parents, tree))
  proc(tree, parents)
}

export function breadthFirst<T>(tree: TreeNode<T>, proc: (node: TreeNode<T>, parents: TreeNode<T>[]) => void) {
  let queue = new Queue<[TreeNode<T>, TreeNode<T>[]]>()
  queue.add([tree, []])
  while (queue.size() > 0) {
    const [node, parents] = queue.dequeue()
    proc(node, parents)
    for (const child of node.getChildren())
      queue.add([child, push(node, parents)])
  }
}

export function wideLayout<T>(root: TreeNode<T>): Grid<TreeNode<T>> {
  const grid = new FlexGrid<TreeNode<T>>()
  let i = 0
  depthFirstInOrder(root, (node, parents) => {
    grid.set([i, parents.length], node)
    ++i;
  })
  return grid
}

export interface CornerOptions {
  top?: boolean
  left?: boolean
  bottom?: boolean
  right?: boolean
}

export function drawCorner(grid: Grid<string>, [sx, sy]: Vec2, [dx, dy]: Vec2, options: CornerOptions = {}) {
  const left = options.left !== undefined ? options.left : !options.right
  const top = options.top !== undefined ? options.top : !options.bottom
  for (let i = Math.min(sx, dx)+(left ? 1 : 0); i < Math.max(sx, dx); ++i) {
    grid.set([i, (top ? Math.min : Math.max)(sy, dy)], '─')
  }
  for (let j = Math.min(sy, dy)+(top ? 1 : 0); j < Math.max(sy, dy); ++j) {
    grid.set([(left ? Math.min : Math.max)(sx,dx), j], '│')
  }
  if (top && left)
    grid.set([Math.min(sx, dx), Math.min(sy, dy)], '┌')
  else if (!top && left)
    grid.set([Math.min(sx, dx), Math.max(sy, dy)], '└')
  else if (top && !left)
    grid.set([Math.max(sx, dx), Math.min(sy, dy)], '┐')
  else
    grid.set([Math.max(sx, dx), Math.max(sy, dy)], '┘')
}

// http://www.utf8-chartable.de/unicode-utf8-table.pl?start=9472&unicodeinhtml=dec
// Elements have the form [top, left, bottom, right, char]
const boxDrawings: [boolean, boolean, boolean, boolean, string][] = [
  [true, false, true, true, '│'],
  [false, true, true, false, '─'],
  [true, true, false, false, '┘'],
  [true, false, false, true, '└'],
  [false, true, true, false, '┐'],
  [false, false, true, true, '┌'],
  [true, true, true, false, '┤'],
  [true, true, false, true, '┴'],
  [true, false, true, true, '├'],
  [false, true, true, true, '┬'],
  [true, true, true, true, '┼'],
]

function find<T>(arr: T[], pred: (el: T) => boolean) {
  for (const el of arr)
    if (pred(el))
      return el
}

function startsWith(a: any[], b: any[]) {
  if (b.length > a.length)
    return false
  for (let i = 0; i < b.length; ++i)
    if (a[i] !== b[i])
      return false
  return true
}

export function isBoxDrawing(str: string) {
  return find(boxDrawings, ([top, left, bottom, right, c]) => c === str) !== undefined
}

export function mergeBoxDrawings(...glyphs: string[]) {
  let out = [false, false, false, false]
  for (const glyph of glyphs) {
    const def = find(boxDrawings, ([top, left, bottom, right, c]) => c === glyph).slice(0,-1)
    if (def === undefined)
      throw new Error(`${glyph} is not a box drawing`)
    for (let i = 0; i < 4; ++i)
      out[i] = out[i] || !!def[i]
  }
  return find(boxDrawings, (def) => startsWith(def, out))[4]
}

export class BoxDrawGrid extends ArrayGrid<string> {
  set([x,y]: Vec2, c: string) {
    const val = this.get([x,y])
    if (isBoxDrawing(val) && isBoxDrawing(c)) {
      super.set([x,y], mergeBoxDrawings(val, c))
    } else {
      super.set([x,y], c)
    }
  }
}

export function drawArrow(out: Grid<string>, [sx, sy]: Vec2, [dx, dy]: Vec2) {
  const mx = Math.round((sx + dx) / 2), my = Math.round((sy + dy) / 2)
  drawCorner(out, [sx,sy], [mx,my], { left: sx < dx, top: false })
  drawCorner(out, [mx,my], [dx,dy], { right: sx < dx, top: true })
}

export function renderTree<T>(layout: FlexGrid<TreeNode<T>>, root: TreeNode<T>) {

  const out = new BoxDrawGrid<string>(layout.width, layout.height * 2 - 1)

  function renderToGrid(node: TreeNode<T>, depth = 1) {
    const children = node.getChildren()
    const [nx, ny] = layout.getPosition(node) 
    for (let i = 0; i < children.length; ++i) {
      const child = children[i]
      const [cx, cy] = layout.getPosition(child)
      drawArrow(out, [nx, ny * 2], [cx, cy * 2])
    }
    out.set([nx, ny * 2], node.getValue().toString())
    for (let i = 0; i < children.length; ++i)
      renderToGrid(children[i], depth+1)
  }

  renderToGrid(root)

  return gridToString(out)
}

