
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
  delete(el: T)
}

export default UnorderedContainer

