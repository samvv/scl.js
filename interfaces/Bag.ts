
import { UnorderedContainer } from "./UnorderedContainer"

/**
 * A bag is much like a set, in that no order is specified on the underlying
 * elements, but contrary to a set it can hold multiple values of the same
 * kind.
 */
export interface Bag<T> extends UnorderedContainer<T> {
  // nothing to see here
}