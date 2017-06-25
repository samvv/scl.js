
import { Vec2 } from "./math"

export class Grid<T> {
  
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

  delete([x, y]: Vec2) {
    delete this._values[x * this.height + y]
  }

}

export default Grid

