
import { Iterator } from "../interfaces/Iterator"
import { AbstractIterator } from "./AbstractIterator"

export class ArrayIterator<T> extends AbstractIterator<T> implements Iterator<T> {

  arr: T[]
  index: number

  constructor(arr: T[], index?: number) {
    super()
    this.arr = arr
    this.index = index || 0 
  }

  next(): { done: boolean, value?: any } {
    if (this.index + 1 === this.arr.length)
      return { done: true }
    return { done: false, value: this.arr[++this.index] }
  }

  prev(): { done: boolean, value?: any } {
    if (this.index - 1 < 0)
      return { done: true }
    return { done: false, value: this.arr[--this.index] }
  }

  nextN(offset: number): { done: boolean, value?: any } { 
    const newCurr = this.index + offset
    if (newCurr < 0 || newCurr >= this.arr.length)
      return { done: true }
    return { done: false, value: this.arr[this.index = newCurr] }
  }

  prevN(offset: number) {
    return this.nextN(-offset)
  }

}

