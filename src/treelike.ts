
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

  spacings: number[]
  
  constructor(public node: TreeLike<T>) {
    this.spacings = node.getChildren().map(child => 0)
  }

  getBounds(): Vec2 {
    return [add(...this.spacings)+this.spacings.length, 2]
  }

  getRelativeOffsetOfChild(i) {
    return add(...this.spacings.slice(0, i))+i
  }

  render() {
    function renderValue(node) {
      return node.getValue().toString()
    }
    const children = this.node.getChildren()
    let output = ''
    if (children.length === 0)
      output += `${renderValue(this.node)}`
    else if (children.length === 1)
      output += `${renderValue(this.node)}\n│\n${renderValue(children[0])}`
    else if (children.length % 2 === 1) {
      output += ' '.repeat(this.getRelativeOffsetOfChild(Math.floor(children.length / 2))+1)+renderValue(this.node)+'\n'
      for (let i = 0; i < children.length; ++i) {
        if (i === 0)
          output += '┌'+'─'.repeat(this.spacings[i]+1)
        else if (i === children.length-1)
          output += '┐'
        else if (i === Math.floor(children.length / 2))
          output += '┼'+'─'.repeat(this.spacings[i]+1)
        else
          output += '┬'+'─'.repeat(this.spacings[i]+1)
      }
      output += '\n'
      for (let i = 0; i < children.length; ++i) {
        const child = children[i]
        output += ' '.repeat(i === 0 ? 0 : this.spacings[i-1])+renderValue(child)+' '
      }
    } else { 
      output += ' '.repeat(this.getRelativeOffsetOfChild(children.length / 2)+children.length / 2-1)+renderValue(this.node)+'\n'
      for (let i = 0; i < children.length; ++i) {
        const line = ((children.length / 2)-1 === i) ?  '┴' : '─'
        if (i === 0)
          output += `┌${'─'.repeat(this.spacings[i])}${line}`
        else if (i === children.length-1)
          output += '─'.repeat(this.spacings[i])+'┐'
        else
          output += `┬${'─'.repeat(this.spacings[i])}${line}`
      }
      output += '\n'
      for (let i = 0; i < children.length; ++i) {
        const child = children[i]
        output += i === children.length-1 
          ? ' '.repeat(this.spacings[i])+renderValue(child) 
          : renderValue(child)+' '.repeat(this.spacings[i]+1)
      }
    }
    return rightLineTrim(output)
  }

}

export function renderTree<T>(tree: TreeLike<T>) {

  function createBox(tree) {
    let rootBox = new TreeBox(tree)
    const children = tree.getChildren()
    for (let i = 0; i < children.length; ++i) {
      const child = children[i]
      const childBox = createBox(child)
      while (isOverlapping(rootBox.render(), childBox.render()), [rootBox.getRelativeOffsetOfChild(i), 1]) {
        console.log(rootBox.getRelativeOffsetOfChild(i))
        ++rootBox.spacings[i]
      }
    }
    return rootBox
  }

  const box = createBox(tree)

  return box.render()
}

