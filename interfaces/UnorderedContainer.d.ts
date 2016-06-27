
import { Container } from "./Container"

/**
 * Represents a container that explicitly has no order defined on its elements.
 */
export interface UnorderedContainer<T> extends Container<T> {
  /**
   * Add an element to the container. The element is place where the container
   * sees fit.
   */
  add(el: T)
  /**
   * Remove an element from the container. If multiple elements are matched,
   * the container picks one of them.
   */
  remove(el: T)
  /**
   * Remove all occurrences of the given element from the container. This is
   * only needed for containers that have no uniqueness constraint on them.
   */
  removeAll?(el: T)
}

