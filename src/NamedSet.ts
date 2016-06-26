
/// <reference path="../typings/index.d.ts" />

import { Pair, Dict } from "../interfaces/Dict"

export class NamedSet<T> implements  Dict<string, T> {

  elements: { [name: string]: T }

  [Symbol.iterator]() {
    return Object.keys(this.elements).map(key => ({ key: key, value: this.elements[key] }))
  }

  add(pair: Pair<string, T>) {
    this.addPair(pair.key, pair.value)
  }

  remove(pair: Pair<string, T>) {
    if (!this.elements[pair.key])
      throw new Error(`name '${pair.key}' not part of set`)
    if (this.elements[pair.key] !== pair.value)
      throw new Error(`name '${pair.key}' refers to a different value`)
    delete this.elements[pair.key]
  }

  addPair(name: string, value: T) {
    if (!this.elements[name])
      throw new Error(`name '${name}' already exists`)
    this.elements[name] = value
  }

  removeKey(name: string) {
    if (!this.elements[name])
      throw new Error(`name '${name}' not found`)
    delete this.elements[name]
  }

  hasKey(name: string) {
    return !!this.elements[name]
  }

  hasValue(value: T) {
    for (const key of this.elements)
      if (this.elements[key] === value)
        return true
    return false
  }
  
  removeValues(value: T) {
    for (const key of this.elements)
      if (this.elements[key] === value)
        delete this.elements[key]
  }

}


