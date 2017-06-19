
import { MultiContainer } from "./Multi"
import { OrderedContainer } from "./Ordered"

/**
 * A list is a positional container which can contain multiple elements of the
 * same kind. A list is characterized by low-cost insertion of elements, while
 * referencing an element at a given position is generally slower.
 */
export interface List<T> extends MultiContainer<T>, OrderedContainer<T> {
  rest(): List<T>
}

