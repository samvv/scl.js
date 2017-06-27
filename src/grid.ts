
import { Vec2 } from "./math"
import { Grid } from "../interfaces"

export class ArrayGrid<T> implements Grid<T> {
  
  _values: T[]

  constructor(public width: number, public height: number) {
    this._values = new Array(width * height)
  }

  get([x, y]: Vec2) {
    return this._values[x * this.height + y]
  }

  set([x, y]: Vec2, val: T) {
    this._values[x * this.height + y] = val
  }

  has([x, y]: Vec2) {
    return this._valeus[x * this.height + y] !== undefined
  }

  delete([x, y]: Vec2) {
    delete this._values[x * this.height + y]
  }

}

export default ArrayGrid

