
import Queue from "./queue"

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

function max(...els) {
  let res = 0
  for (const el of els)
    res = Math.max(el, res)
  return res
}

function add(...els) {
  let res = 0
  for (const el of els)
    res += el
  return res
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

type Vec2 = [number, number]

interface Box {
  //getBounds(): Vec2
  render(): string
}

class Cursor {

  constructor(public position: Vec2 = [0, 0]) {

  }

  advance(str: string) {
    for (const c of str) {
      if (c === '\n') {
        ++this.position[1];
        this.position[0] = 0;
      } else 
        ++this.position[0]
    }
  }

}

function cursorsEqual(a: Cursor, b: Cursor) {
  return a.position[0] === b.position[0] && a.position[1] === b.position[1]
}

function trimRight(str) {
  return str.replace(/\s*$/, '')
}

export function rightLineTrim(str: string) {
  return str.split('\n').map(line => trimRight(line)).join('\n')
}

export function seek(str: string, [x, y]: Vec2) {
  let offset = 0
  for (let i = 0; y > 0; ++i) {
    if (i >= str.length)
      throw new Error(`nog enough lines`)
    const c = str[i]
    if (c === '\n')
      --y;
    ++offset;
  }
  for (let i = 0; x > 0; ++i) {
    const c = str[i]
    if (c === '\n')
      throw new Error(`line not long enough`)
    --x;
    ++offset;
  }
  return str.substring(offset)
}

export function isOverlapping(stra: string, strb: string, offset: Vec2 = [0,0]): boolean {
  stra = seek(stra, offset)
  let cursorA = new Cursor(), cursorB = new Cursor()
  for (let i = 0; i < stra.length && i < strb.length; ++i) {
    cursorA.advance(stra[i])
    cursorB.advance(strb[i])
    if (cursorsEqual(cursorA, cursorB)
        && !/\s/.test(stra[i])
        && !/\s/.test(strb[i]))
        return true
  }
  return false
}

export function indent(text: string, amount: number) {
  return text.split('\n').map(line => ' '.repeat(amount)+line).join('\n')
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

  getBounds(): Vec2 {
    return [add(...this.spacings)+this.spacings.length, 2]
  }

  getOffsetOfChild(i) {
    return add(...this.spacings.slice(0, i))
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
          console.log('here')
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
    let rootBox = new TreeBox(tree)
    const children = tree.getChildren()
    for (let i = 0; i < children.length; ++i) {
      const child = children[i]
      const childBox = createBox(child)
      while (isOverlapping(rootBox.render(), childBox.render()), [rootBox.getOffsetOfChild(i), 1]) {
        console.log(rootBox.getOffsetOfChild(i))
        ++rootBox.spacings[i]
      }
    }
    return rootBox
  }

  const box = createBox(tree)

  return box.render()
}

