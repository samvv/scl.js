
import { Pair, MultiDict } from "../../../interfaces"
import { StringSet } from "../../set/string"

export class StringMultiDict implements MultiDict<string, string> {

  _values: { [key: string]: StringSet } = Object.create(null)

  add([key, val]: Pair<string, string>) {
    this.addPair(key, val)
  }

  count([key, value]: Pair<string, string>): number {
    const s = this._values[key]
    if (s === undefined)
      throw new Error(`key ${key} not found`)
    return s.has(value) ? 1 : 0
  }

  size() {
    let res = 0
    for (const key of Object.keys(this._values))
      res += this._values[key].size()
    return res
  }

  has(pair: Pair<string, string>) {
    return this.hasKey(pair[0])
  }

  addPair(key: string, value: string) {
    if (this._values[key] !== undefined)
      throw new Error(`key ${key} already taken`)
    this._values[key].add(value)
  }

  hasValue(val: string) {
    for (const key of Object.keys(this._values))
      for (const otherValue of this._values[key])
        if (otherValue === val)
          return true
    return false
  }

  getValues(key: string) {
    const value = this._values[key]
    if (value === undefined)
      throw new Error(`key ${key} not found`)
    return [...value]
  }

  hasKey(key: string) {
    return this._values[key] !== undefined
  }

  *iterator(): Iterator<Pair<string, string>> {
    for (const key of Object.keys(this._values))
      for (const value of this._values[key])
        yield [key, value]
  }

  [Symbol.iterator]() {
    return this.iterator()
  }

  delete([key, value]: Pair<string, string>) {
    const s = this._values[key]
    if (s === undefined)
      throw new Error(`key ${key} not found`)
    s.delete(value)
  }

  deleteKeys(key: string) {
    if (this._values[key] === undefined)
      throw new Error(`key ${key} not found`)
    delete this._values[key]
  }

  deleteAll([key, value]: Pair<string, string>) {
    const s = this._values[key]
    if (s === undefined)
      return
    if (s.has(value))
      s.delete(value)
  }

  deleteValues(value: string) {
    for (const key of Object.keys(this._values)) {
      for (const otherValue of this._values[key]) {
        if (value === otherValue)
          delete this._values[key]
      }
    }
  }

  clear() {
    this._values = Object.create(null)
  }

}

export default StringMultiDict

