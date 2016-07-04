
import { MultiContainer } from "./Multi"
import { OrderedContainer } from "./Ordered"

/**
 * A vector is a positional container which can contain multiple elements of
 * the same kind. A vector is characterized by low-cost lookup of elements at a
 * given position, while inserting elements at a given position is generally
 * slower
 */
export interface Vector<T> extends MultiContainer<T>, OrderedContainer<T> { }

