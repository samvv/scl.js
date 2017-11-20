
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
  insertAfter(position: IteratorResult<T>, el: T) 

  /**
   * Insert an element before the element at the given position. The position is
   * deduced from the iterator that is goven to the method.
   */
  insertBefore(position: IteratorResult<T>, el: T)

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
   * Get the first element in the container.
   *
   * For queuelike structures such as a stack, this method will be of great
   * significance.
   *
   * For maplike structures such as a set, this method is <b>not</b> guaranteed
   * to give back the element that was first inserted.
   */
  first(): T

  /**
   * Get the last element in the container.
   *
   * For queuelike structures such as a stack, it is preferred to reverse the
   * order of the container and use `first()` instead, as this can be faster
   * than finding the last element.
   *
   * For unordered containers such as a set, this method is <b>not</b>
   * guaranteed to give back the element that was most recently inserted.
   */
  last(): T

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

  /**
   * Remove the element pointed to by the iterator result from this container.
   */
  delete(pos: IteratorResult<T>): void;

}

