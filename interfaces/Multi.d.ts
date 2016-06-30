
import { Container } from "./Container"

/**
 * Represents any container which can contain multiple elements of the same
 * kind.
 */
export interface MultiContainer<T> extends Container<T> {
  /**
   * Count all elements which belong to the same kind as the element being
   * passed in.
   */
  count(el: T): number
  /**
   * Remove all occurrences of the given element in the container, possibly
   * doing nothing in the case there are no elements to be removed.
   */
  removeAll(el: T)
}

