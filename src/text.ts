
import { Vec2 } from "./math" 

export class Cursor {

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

export function cursorsEqual(a: Cursor, b: Cursor) {
  return a.position[0] === b.position[0] && a.position[1] === b.position[1]
}

export function trimRight(str) {
  return str.replace(/\s*$/, '')
}

export function rightLineTrim(str: string) {
  return str.split('\n').map(line => trimRight(line)).join('\n')
}

export function seek(str: string, [x, y]: Vec2) {
  let offset = 0
  for (let i = 0; y > 0; ++i) {
    if (i >= str.length)
      return null
    const c = str[i]
    if (c === '\n')
      --y;
    ++offset;
  }
  for (let i = 0; x > 0; ++i) {
    const c = str[i]
    if (c === '\n')
      return null
    --x;
    ++offset;
  }
  return str.substring(offset)
}

export function isOverlapping(stra: string, strb: string, offset: Vec2 = [0,0]): boolean {
  stra = seek(stra, offset)
  if (stra === null)
    return false
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

export function hasConflict(stra: string, strb: string, offset: Vec2 = [0, 0]): boolean {
  stra = seek(stra, offset)
  if (stra === null)
    return false
  let cursorA = new Cursor(), cursorB = new Cursor()
  for (let i = 0; i < stra.length && i < strb.length; ++i) {
    cursorA.advance(stra[i])
    cursorB.advance(strb[i])
    if (cursorsEqual(cursorA, cursorB)
        && !/\s/.test(stra[i])
        && !/\s/.test(strb[i])
        && stra[i] !== strb[i])
        return true
  }
  return false
}

export function indent(text: string, amount: number) {
  return text.split('\n').map(line => ' '.repeat(amount)+line).join('\n')
}

