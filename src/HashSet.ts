
import { HashIndex, HashIndexCursor, HashIndexOptions } from "./HashIndex";

export type HashSetCursor<T> = HashIndexCursor<T>;

export interface HashSetOptions<T> extends HashIndexOptions<T, T> {

}

/**
 * A collection of elements where each element has to be unique.
 *
 * Internally, a hash set is just a tiny wrapper around a [[HashIndex]] where
 * the key is equal to the element being added/removed.
 */
export class HashSet<T> extends HashIndex<T, T> {

}

