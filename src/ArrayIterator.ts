
import { Iterator } from "../interfaces/Iterator"

export class ArrayIterator<T> implements Iterator<T> {

  arr: T[]
  curr: number

  constructor(arr: T[], curr?: number) {
    this.arr = arr
    this.curr = curr || 0 
  }

  next(): { done: boolean, value?: any } {
    if (this.curr + 1 === this.arr.length)
      return { done: true }
    return { done: false, value: this.arr[++this.curr] }
  }

  prev(): { done: boolean, value?: any } {
    if (this.curr - 1 < 0)
      return { done: true }
    return { done: false, value: this.arr[--this.curr] }
  }

  nextN(offset: number): { done: boolean, value?: any } { 
    const newCurr = this.curr + offset
    if (newCurr < 0 || newCurr >= this.arr.length)
      return { done: true }
    return { done: false, value: this.arr[this.curr = newCurr] }
  }

  prevN(offset: number) {
    return this.nextN(-offset)
  }

}

