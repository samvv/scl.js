
import Queue from "./queue"
import { Vec2, Mat2d, add, max } from "./math"
import { trimLineRight, isOverlapping, hasConflict, Cursor } from "./text"
import Grid from "./grid"
import { Box, StaticBox, OverlapBox, BoxTransform } from "./box"

function flattenDeep<T>(arr: T[]) {
  let res = []
  for (const el of arr) {
    if (el instanceof Array)
      for (const el2 of el)
        res.push(el2)
    else
      res.push(el)
  }
  return res
}

export interface TreeLike<T> {
  getChildren(): TreeLike<T>[]
  getValue(): T;
  parent?: TreeLike<T> | null
}

export function getDepth(tree, depth = 0) {
  let maxDepth = 0
  for (const child of tree.getChildren())
    maxDepth = Math.max(maxDepth, getDepth(child, depth+1))
  return maxDepth
}

export function getLeaves(tree) {
  const children = tree.getChildren()
  if (children.length === 0)
    return [tree]
  return children.map(getLeaves)
}

// TODO: add support for paths?
export function breadthFirst<T>(tree: TreeLike<T>, proc: (node: TreeLike<T>, level: number, parent: TreeLike<T> | null) => void) {
  let queue = new Queue<[number, TreeLike<T>, TreeLike<T> | null]>()
  queue.add([0, tree, null])
  while (queue.size() > 0) {
    const [level, node, parent] = queue.dequeue()
    proc(node, level, parent)
    for (const child of node.getChildren())
      queue.add([level+1, child, node])
  }
}

export function stackNodes<T>(tree: TreeLike<T>) {
  let res = [ [] ], currLevel = 0
  breadthFirst(tree, (child, level) => {
    if (level !== currLevel) {
      res.push([])
      currLevel = level
    }
    res[res.length-1].push(child)
  })
  return res
}

export function parentize<T>(tree: TreeLike<T>) {
  breadthFirst(tree, (node, level, parent) => {
    tree.parent = parent
  })
  return tree
}

export class TreeBox<T> {

  nodeOffset: number
  spacings: number[]
  
  constructor(public node: TreeLike<T>) {
    const children = node.getChildren()
    this.spacings = (new Array(children.length-1)).fill(1)
    //this.nodeOffset = this.getOffsetOfChild(children.length % 2 === 0 ? children.length / 2 : Math.floor(children.length / 2)+1)
    this.alignMiddle()
  }

  alignMiddle() {
    this.nodeOffset = Math.floor(this.getTotalWidth() / 2)
  }

  alignLeft() {
    this.nodeOffset = 0
  }

  alignRight() {
    this.nodeOffset = this.getTotalWidth()
  }

  alignWithChild(i: number) {
    const children = this.node.getChildren()
    let offset = 0
    while (i > 0) {
      offset += this.spacings[i]+1
      --i
    }
    this.nodeOffset = offset
  }

  leftChildren() {
    const res = []
        , children = this.node.getChildren()
    let offset = 0;
    for (let i = 0; i < children.length && offset < this.nodeOffset; ++i) {
      res.push(children[i])
      offset += this.spacings[i]+1
    }
    return res
  }

  rightChildren() {
    return this.node.getChildren().slice(this.leftChildren().length)
  }

  getBounds(): Vec2 {
    return [this.getTotalWidth(), 2]
  }

  getOffsetOfChild(i: number) {
    return -Math.min(this.nodeOffset, 0)+add(...this.spacings.slice(0, i))+i
  }

  getTotalWidth() {
    return Math.max(add(...this.spacings)+this.node.getChildren().length, this.nodeOffset !== undefined ? this.nodeOffset+1 : 0)
  }

  getChildOnOffset(offset: number) {
    for (let i = 0; i < this.spacings.length; ++i) {
      offset -= (this.spacings[i]+1)
      if (offset < 0)
        return null
      if (offset === 0)
        return i
    }
    return offset === 0 ? 0 : null
  }

  render() {
    function renderValue(node) {
      return node.getValue().toString()
    }
    const children = this.node.getChildren()
    let output = ' '.repeat(Math.max(this.nodeOffset, 0))+renderValue(this.node)
    output += '\n'
    for (let j = Math.min(this.nodeOffset, 0); j < this.getTotalWidth(); ++j) {
      const child = this.getChildOnOffset(j)
      if (j < 0) {
        if (j === this.nodeOffset) {
          if (children.length === 1)
            output += '│'
          else
            output += '└'
        } else {
          output += '─'
        }
      } else if (j === 0) {
        if (this.nodeOffset === 0) {
          if (children.length === 1)
            output += '│'
          else
            output += '├'
        } else if (this.nodeOffset < 0)
          output += '┬'
        else
          output += '┌'
      } else if (j === this.getTotalWidth()-1) {
        if (j === this.nodeOffset) {
          if (child === null)
            output += '┘'
          else
            output += '┤'
        } else if (child !== null)
          output += '┐'
        else
          output += '─'
      } else {
        if (this.nodeOffset === j) {
          if (child !== null)
            output += '┼'
          else
            output += '┴'
        } else if (child !== null)
          output += '┬'
        else
          output += '─'
      }
    }
    output += '\n'
    output += ' '.repeat(-Math.min(this.nodeOffset, 0))
    for (let i = 0; i < children.length; ++i) {
      const child = children[i]
      output += renderValue(child)
      if (i !== children.length-1)
        output += ' '.repeat(this.spacings[i])
    }
    return output
  }

}

export function renderTree<T>(tree: TreeLike<T>) {

  function createBox(tree) {
    const children = tree.getChildren()
    if (children.length === 0)
      return new StaticBox(tree.getValue().toString())
    let rootBox = new TreeBox(tree)
    let mergedBox = rootBox
    let childBoxes = children.map((child, i) => {
      let childBox: Box = createBox(child)
      while (hasConflict(rootBox.render(), childBox.render(), [rootBox.getOffsetOfChild(i), 2])) {
        ++rootBox.spacings[i]
        if (rootBox.getOffsetOfChild(i) < rootBox.nodeOffset)
          ++rootBox.nodeOffset
      }
      return new BoxTransform(childBox, Mat2d.fromTranslation([rootBox.getOffsetOfChild(i), 2]))
    })
    return new OverlapBox(rootBox, ...childBoxes)
  }

  const box = createBox(tree)

  return box.render()
}

