
import { Vec2, max } from "../math"
import { Grid } from "../../interfaces"

function parsePoint(str: string): Vec2 {
  const split = str.split(':')
  return [parseInt(split[0]), parseInt(split[1])]
}

export class FlexGrid<T> implements Grid<T> {
 
  _points: { [point: string]: T } = Object.create(null)
  _values = new Map<T, Vec2>()

  getBounds() {
    return Vec2.max(...Object.keys(this._points).map(parsePoint))
  }

  get width() {
    return max(...Object.keys(this._points).map(point => parseInt(point.split(':')[0])))+1
  }

  get height() {
    return max(...Object.keys(this._points).map(point => parseInt(point.split(':')[1])))+1
  }

  *[Symbol.iterator](): IterableIterator<[Vec2, T]> {
    const height = this.height
    for (const point of Object.keys(this._points).map(parsePoint).sort((a: Vec2, b: Vec2) => (a[0] * height + a[1]) - (b[0] * height + b[1])))
      yield [point, this._points[`${point[0]}:${point[1]}`]]
  }

  getPosition(val: T) {
    return this._values.get(val)
  }

  set([x, y]: Vec2, val: T) {
    this._points[`${x}:${y}`] = val
    this._values.set(val, [x, y])
  }

  delete([x,y]: Vec2) {
    const val = this.get([x,y])
    if (val !== undefined) {
      delete this._points[`${x}:${y}`]
      this._values.delete(val)
    }
  }

  has([x,y]: Vec2) {
    return this._points[`${x}:${y}`] !== undefined
  }

  get([x,y]: Vec2) {
    return this._points[`${x}:${y}`]
  }

}

export default FlexGrid

