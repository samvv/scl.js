
import { UnorderedContainer } from "./Unordered"

export interface MinHeap<T> extends UnorderedContainer<T> {
  min(): T
  deleteMin()
}

export interface MaxHeap<T> extends UnorderedContainer<T> {
  min(): T
  deleteMin()
}

