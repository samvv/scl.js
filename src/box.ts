
import { Vec2, Mat2d } from "./math"
import { trimLineRight, Cursor } from "./text"
import Grid from "./grid"

function gridToString(grid: Grid<string>) {
  let out = ''
  for (let j = 0; j < grid.height; ++j) {
    for (let i = 0; i < grid.width; ++i) {
      const c = grid.get([i,j])
      if (c === undefined)
        out += ' '
      else
        out += c
    }
    if (j !== grid.height-1)
      out += '\n'
  }
  return trimLineRight(out)
}

export interface Box {
  getBounds(): Vec2
  render(): string
}

export class StaticBox {
  nodeOffset = 0
  constructor(public content: string) {

  }
  getBounds(): Vec2 {
    let line = 0, column = 0, mw = 0
    for (const c of this.content) {
      if (c === '\n') {
        if (column > mw)
          mw = column
        ++line;
        column = 0
      } else
        ++column
    }
    if (column > mw)
      mw = column
    return [mw, line+1]
  }
  render() {
    return this.content
  }
}

export class OverlapBox {

  childBoxes: Box[]

  getBounds(): Vec2 {
    return Vec2.max(...this.childBoxes.map(box => box.getBounds()))
  }

  constructor(...childBoxes: Box[]) {
    this.childBoxes = childBoxes
  }

  render() {
    const [w, h] = this.getBounds()
    const grid = new Grid<string>(w, h)
    for (const childBox of this.childBoxes) {
      const cursor = new Cursor()
      for (const c of childBox.render()) {
        if (c !== '\n' && c !== ' ')
          grid.set(cursor.position, c)
        cursor.advance(c)
      }
    }
    return gridToString(grid)
  }

}

export class BoxTransform {

  constructor(public box: Box, public transform: Mat2d = Mat2d.identity()) {
    
  }

  getBounds() {
    const [w, h] = this.box.getBounds()
    return Vec2.max(
      Vec2.transformMat2d([0,0], this.transform),
      Vec2.transformMat2d([w,0], this.transform),
      Vec2.transformMat2d([0,h], this.transform),
      Vec2.transformMat2d([w,h], this.transform),
    )
  }

  render() {
    const [w, h] = this.getBounds()
    const grid = new Grid<string>(w, h)
    const cursor = new Cursor()
    for (const c of this.box.render()) {
      if (c !== '\n')
        grid.set(Vec2.transformMat2d(cursor.position, this.transform), c)
      cursor.advance(c)
    }
    return gridToString(grid)
  }

}

