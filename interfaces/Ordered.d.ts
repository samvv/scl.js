
import { Iterator } from "./Iterator"
import { Container } from "./Container"

/**
 * Represents any container that has an order defined on its elements.
 */
export interface OrderedContainer<T> extends Container<T> {
  /**
   * Insert an element after the element at the given position. The position is
   * deduced from the iterator that is given to the method.
   */
  insertAfter(position: Iterator<T>, el: T) 
  /**
   * Insert an element before the element at the given position. The position is
   * deduced from the iterator that is goven to the method.
   */
  insertBefore(position: Iterator<T>, el: T)
  /**
   * Append an item at the end of the container. The element will be given the
   * highest order.
   */
  append(el: T)
  /**
   * Prepend an item to the beginning of the container. The element will be
   * given the lowest order.
   */
  prepend(el: T) 
  /**
   * Return an iterator that is initially placed at the lowest element in the container.
   */
  begin(): Iterator<T>
  /**
   * Return an iterator that is initially placed at the highest element in the container.
   */
  end(): Iterator<T>
  /**
   * Return an iterator that is places at the element which is the Nth element
   * in the ascending row leading up to element.
   */
  at(position: number): IteratorResult<T>
}

