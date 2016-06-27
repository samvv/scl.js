
import { Iterator } from "./Iterable"
import { Containerr } from "./Container"

/**
 * Represents any container that has an order defined on its elements.
 */
export interface OrderedContainer<T> extends Container<T> {
  ref(position: Iterator<T>)
  insert(position: Iterator<T>) 
  append(el: T)
  prepend(el: T) 
}

