
import { UnorderedContainer } from "../interfaces/Unordered"

export interface Heap<T> extends UnorderedContainer<T> {
  min(): T
  max(): T
  removeMin()
  removeMax()
}

//export function hashHeapPositions<T>(heap: Heap<T>) {
  //// TODO: separate me from ArrayHeap implementation
  //return new class implements Heap<T> {
    //min() { return heap.min() }
    //max() { return heap.max() }
    //removeMin() { heap.removeMin() }
    //removeMax() { heap.removeMax() }
    //positions: { [el: T]: number } = {}
    //private swap() {

    //}
    //add(el: T) {
    //}
    //remove(el: T) {
      //heap.removeAt(this.positions[el])
    //}
  //}
//}

/**
 * A heap using plain JavaScript arrays as storage method and supporting O(log(n)) removal of elements.
 */
export class ArrayHeap<T> implements Heap<T> {

  arr: T[]
  lt: (a: T, b: T) => boolean
  size: number = 0
  allocSize: number
  initSize: number
  //positions: { [el: T]: number } = {}

  constructor(initSize: number, allocSize: number, lt: (a: T, b: T) => boolean) {
    this.arr = new Array(initSize)
    this.lt = lt
    this.initSize = initSize
    this.allocSize = allocSize
  }
  
  has(el: T) {
    for (const item of this.arr)
      if (item === el)
        return true
    return false
  }

  isEmpty() {
    return this.size === 0
  }

  clear() {
    this.size = 0
    this.arr = new Array(this.initSize)
  }

  min() {
    if (this.size === 0)
      throw new Error(`heap does not contain any elements`)
    return this.arr[0]
  }

  max() {
    throw new Error(`unsupported operation`)
  }

  add(el: T) {
    this.ensureFreeSpace()
    this.arr[this.size] = el
    //this.positions[el] = this.size // will be taken care of by swap()
    this.siftUp(this.size+1)
    ++this.size
  }

  remove(el: T) {
    //const pos = this.positions[el]
    //if (pos === undefined)
      //throw new Error(`element ${el} not found`)
    //this.removeAt(pos)
    for (let i = 0; i < this.arr.length; ++i)
      if (this.arr[i] === el) {
        this.removeAt(i+1)
        return
      }
    throw new Error(`element ${el} not found`)
  }

  removeMax() { 
    throw new Error(`unsupported operation`)
  }

  removeMin() {
    this.removeAt(1)
  }
 
  private removeAt(pos: number) {
    console.log(`removing at ${pos} ...`)
    this.arr[pos-1] = this.arr[this.size-1]
    this.arr[this.size-1] = null
    --this.size
    if (pos !== 1 && this.lt(this.arr[pos-1], this.arr[Math.floor(pos / 2)-1]))
      this.siftUp(pos)
    else
      this.siftDown(pos)
  }


  private ensureFreeSpace() {
    if (this.size >= this.arr.length) {
      const oldArr = this.arr
          , newArr = new Array(this.size + this.allocSize)
      for (let i = 0; i < oldArr.length; ++i)
        newArr[i] = oldArr[i]
      this.arr = newArr
    }
  }

  private siftUp(pos: number) {
    let el = this.arr[pos-1]
    while (true) {
      let parent = Math.floor(pos / 2)
      if (parent === 0) {
        this.arr[pos-1] = el
        break 
      }
      if (this.lt(el, this.arr[parent-1])) {
        this.arr[pos-1] = this.arr[parent-1]
        pos = parent
      } else {
        this.arr[pos-1] = el
        break
      }
    }
  }

  private siftDown(pos: number) {
    let el = this.arr[pos-1]
    while (true) { 
      let child1 = pos * 2
        , child2 = pos * 2 + 1
        , smallest = (child1 < this.size)
          ? (this.lt(this.arr[child1-1], this.arr[child2-1])
            ? (this.lt(el, this.arr[child1-1]) ? pos : child1)
            : (this.lt(el, this.arr[child2-1]) ? pos : child2))
          : (child1 === this.size
            ? (this.lt(el, this.arr[child1-1]) ? pos : child1)
            : pos)
      if (pos === smallest) {
        this.arr[pos-1] = el
        break
      } else {
        this.arr[pos-1] = this.arr[smallest-1]
        pos = smallest
      }
    }
  }

}

