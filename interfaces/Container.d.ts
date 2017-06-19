
import { Iterator } from "./Iterator"

/**
 * Represents a non-hiercarchical holder of data values in the most abstract
 * sense of the word.
 */
export interface Container<T> {
  /**
   * Checks if the container holds the given element.
   *
   * @param el The element to check membership of.
   * @return True if the containers holds the given element, false otherwise.
   */
  has(el: T): boolean

  /**
   * @see #iterator()
   */
  [Symbol.iterator](): Iterator<T>

  /**
   * Returns an object which is able to sift through the values in this container.
   *
   * One iterator is guaranteed to loop over its elements in the same order
   * that it was created. However, different iterators are not guaranteed to
   * produce the same order. See {@link OrderedContainer} if you need a
   * container that does provide this guarantee.
   */
  iterator(): Iterator<T> 

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
   * Remove all elements from this container, effectively setting the container
   * to the empty state.
   */
  clear()
}

