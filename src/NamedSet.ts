
import { Pair, Dict } from "../interfaces/Dict"

export class NamedSet<T> implements  Dict<string, T> {
  elements: { [name: string]: T }

  add(pairOrKey: Pair<string, T>, value?: T) {
    const key = value === undefined ? pairOrKey.key : pairOrKey
    if (!this.elements[key])
      throw new Error(`name '${key}' already exists`)
    this.elements[key] = value === undefined ? pairOrKey.value | pairOrKey
  }

  remove(pairOrKey: Pair<string, T> | string) {
    const key = isPair(pairOrKey) ? pair.key : pairOrKey
    if (!this.elements[key])
      throw new Error(`name '${key}' not found`)
    delete this.elements[key]
  }

}


