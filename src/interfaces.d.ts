
/**
 * Base interface for any data structure that contains multiple elements.
 *
 * @typeparam T The type of element in the collection.
 */
export interface Collection<T> {

  /**
   * Returns a transparent object that can be used as an argument to {@link add} 
   * to speed up things. Generally, you don't have to use this method.
   */
  getAddHint?(element: T): any;

  /**
   * Add an element to the collection. If the element already exists, update its
   * value.
   *
   * The location where the element is placed depends on the collection type,
   * and in the generic case there is no guarantee on the location where it is
   * inserted.
   *
   * This method returns a pair with the first element indicating whether the
   * element was added, while the second element refers to the actual location
   * of the element.
   *
   * @param hint A transparent object obtained by {@link getAddHint}.
   */
  add(element: T, hint?: any): AddResult<T>;

  /**
   * Checks if the collection holds the given element.
   *
   * @param element The element to check membership of.
   * @return True if the collections holds the given element, false otherwise.
   */
  has(element: T): boolean

  /**
   * Returns an object which is able to sift through the values in this collection.
   *
   * The order by which the elements are traversed depends on the kind of collection.
   * For unordered collections, the iteration order is unspecified and may even differ
   * between two iterations on the same collection.
   */
  [Symbol.iterator](): IterableIterator<T>

  /**
   * @deprecated
   */
  iterator?(): Iterator<T> 

  /**
   * Count the amount of elements in the collection.
   *
   * ⚠️ In most cases, this should be an `O(1)` operation. However, there are
   * cases where this can be an `O(n)` operation. Therefore, it is recommended
   * to always cache the result in a local variable.
   */
  readonly size: number

  /**
   * Remove all elements from this collection, effectively setting the collection
   * to the empty collection.
   */
  clear(): void

  /**
   * Copies all elements in the collection to a new one of the same kind.
   */
  clone(): Collection<T>

  /**
   * Remove the element pointed to by the iterator result from this collection.
   */
  deleteAt(position: Cursor<T>): void;

  /**
   * Remove an element from the collection. If multiple elements are matched,
   * the collection picks one of them.
   *
   * @return `true` if the element was found, `false` otherwise.
   */
  delete(element: T): boolean;

  /**
   * Remove an element from the collection. If multiple elements are matched,
   * the collection removes all of them.
   *
   * @return The amount of elements that was removed.
   */
  deleteAll(element: T): number;

  /**
   * Converts the entire collection to a range.
   */
  toRange(): Range<T>;

}

export type AddResult<T> = [boolean, Cursor<T>];

/**
 * Represents any collection that has an order defined on its elements.
 */
export interface Sequence<T> extends Collection<T> {

  /**
   * Insert an element after the element at the given position. The position is
   * deduced from the iterator that is given to the method.
   */
  insertAfter(position: Cursor<T>, el: T): Cursor<T>;

  /**
   * Insert an element before the element at the given position. The position is
   * deduced from the iterator that is goven to the method.
   */
  insertBefore(position: Cursor<T>, el: T): Cursor<T>;

  /**
   * Append an item at the end of the collection. The element will be given the
   * highest order.
   */
  append(el: T): Cursor<T>;

  /**
   * Prepend an item to the beginning of the collection. The element will be
   * given the lowest order.
   */
  prepend(el: T): Cursor<T>;

  /**
   * Get the first element in the sequence.
   *
   * @throws An error object if the collection is empty.
   */
  first(): T 

  /**
   * Get the last element in the collection.
   *
   * @throws An error object if the collection is empty.
   */
  last(): T

  /**
   * Return a cursor that is placed at the index given by `position` in the
   * sequence.
   */
  at(position: number): Cursor<T>

  /**
   * Allows taking an element directly out of the collection at a given position.
   *
   * This method might be faster than {@link at} because it is not forced to
   * construct a cursor object.
   */
  getAt(position: number): T

}

/**
 * Represents a collection that uses some part of the element to optimise
 * certain operations.
 */
export interface Index<T, K = T> extends Collection<T> {

  /*
   * Returns a range of items that have the same key.
   */
  equalKeys(key: K): Range<T>;

  /**
   * Checks whether there a pair in this collection that has the given key.
   */
  hasKey(key: K): boolean

  /**
   * Similar to `Dict.getValue`, except that it returns the pair that was
   * inserted in the collection.
   */
  findKey(key: K): Cursor<T> | null;

  /**
   * Delete a pair from the underlying collection that has the given key as key.
   * 
   * Returns the amount of items that have been deleted.
   */
  deleteKey(key: K): number;

}

export interface SortedIndex<T, K = T> extends Index<T, K> {

  /**
   * Returns the value that is just below the given value, if any.
   */
  getGreatestLowerBound(key: K): Cursor<T> | null;

  /**
   * Return the value that is just above the given value, if any.
   */
  getLeastUpperBound(key: K): Cursor<T> | null;
}

/**
 * A cursor is a handle to a specific element in a collection.
 */
export interface Cursor<T> {

  /**
   * A reference to the element pointed to by this cursor, as it was inserted
   * into the collection.
   */
  value: T;

  /**
   * Generate all elements from this cursor till the end of the
   * collection.
   *
   * If the collection does not specify an order, this method will not exist.
   */
  nextAll?(): IterableIterator<Cursor<T>>;

  /**
   * Generate all elements from this cursor till the beginning of the
   * collection.
   *
   * If the collection does not specify an order, this method will not exist.
   */
  prevAll?(): IterableIterator<Cursor<T>>;

  /**
   * Get a reference to the cursor that is immediately after this one.
   *
   * If the collection does not specify an order, this method will not exist.
   */
  next?(): Cursor<T> | null;

  /**
   * Get a reference to the cursor that is immediately before to this one. 
   *
   * If the collection does not specify an order, this method will not exist.
   */
  prev?(): Cursor<T> | null;

}

/**
 * A range is a well-defined sequence of elements that are part of a collection.
 *
 * Traversing a range that is being mutated results is undefined behavior (with
 * some exceptions). To be safe, you need to manually make a copy of the
 * elements in the range before adding or removing elements.
 */
export interface Range<T> {

  /**
   * Get how many elements are in this range.
   *
   * ⚠️ This might be an expensive operation, so make sure to cache it if you need
   * frequent access to it.
   */
  readonly size: number;

  /**
   * Get an iterator that sequences the elements contained in this range.
   */
  [Symbol.iterator](): IterableIterator<T>;

  /**
   * Return an iterator that provides cursors to inspect or delete the given element. 
   *
   * @see  {@link Cursor}
   */
  cursors(): IterableIterator<Cursor<T>>;

  /**
   * Filters this range using the given predicate. Iterating over the newly
   * returned range will cause all cursors that did not match the predicate to
   * be omitted.
   */
  filter?(pred: (element: Cursor<T>) => boolean): Range<T>;

  /**
   * Indicates whether this range will traverse its elements in reverse order.
   *
   * @see [[reverse]]
   */
  readonly reversed?: boolean;

  /**
   * Reverse the order of the elements that would be generated with the
   * iterator.
   *
   * Reversing a range is only possible when the order of the elements is
   * well-defined, such as the elements in a list or a tree-based dictionary.
   */
  reverse?(): Range<T>;

}

/**
 * A bag is much like a set, in that no order is specified on the underlying
 * elements, but contrary to a set it can hold multiple values of the same
 * kind.
 */
export interface Bag<T> extends Index<T> {

}

/**
 * Simple sugar for an array-based pair. Used by dictionaries to denote the
 * actual value that is stored in the collection.
 */
export type Pair<K, V> = [K, V]

/**
 * Base interface for `Dict` and `MultiDict`.
 */
export interface DictLike<K, V> extends Index<[K, V], K> {

  /**
   * Creates a new pair and inserts it in the underlying collection.
   */
  emplace(key: K, value: V): [boolean, Cursor<[K, V]>];

}

/**
 * A dictionary, also known as 'maps' in other languages, associates a certain
 * value (called the key) with another value, providing efficient lookup of the
 * value when given the key.
 */
export interface Dict<K, V> extends DictLike<K, V> {

  /**
   * Get the value that is associated with the given key.
   */
  getValue(key: K): V | undefined;

}

/**
 * @experimental
 */
export type Vec2 = [number, number]

/**
 * @experimental
 */
export interface Grid<T> {
  width: number
  height: number
  get(point: Vec2): T
  set(point: Vec2, val: T): void
  delete(point: Vec2): void
  has(point: Vec2): boolean
}

/**
 * A list is a positional collection which can contain multiple elements of the
 * same kind. 
 *
 * A list is characterized by low-cost insertion of elements, while
 * referencing an element at a given position is generally slower.
 * 
 * ```ts
 * const myList = new DoubleLinkedList();
 * 
 * myList.append(1);
 * myList.append(2);
 * myList.append(3);
 *
 * for (const num of myList.toRange().reverse()) {
 *   console.log(num)
 * }
 * ```
 * 
 * Result:
 *
 * <pre>
 * 3
 * 2
 * 1
 * </pre>
 *
 * @typeparam T The type of element in the list.
 */
export interface List<T> extends Sequence<T> {

  /**
   * Get the rest of the list. This operation usually is in <code>O(1)</code>.
   */
  rest(): List<T>

}

/**
 * A `MultiDict` is much like a `Dict`, except that one key can be associated
 * with many values.
 */
export interface MultiDict<K, V> extends DictLike<K, V> {

  /**
   * Get all values that are associated with the given key.
   */
  getValues(key: K): IterableIterator<V>;

}

/**
 * Queuelike structures hold their data in an order that is determined by the
 * structure itself rather than the one who created the collection.
 */
export interface Queuelike<T> extends Collection<T> {
  /**
   * Get the next element in the queue without removing it from the collection.
   *
   * @see Queuelike.pop()
   */
  peek(): T | undefined
  /**
   * Get the next element in the order defined by the queue and remove it
   * from the collection.
   *
   * @see Queuelike.peek()
   */
  pop(): T | undefined
}

/**
 * A collection that stores at most one copy of an element and generally
 * provides fast ways to check the presence of an element.
 *
 * @see [[Dict]]
 */
export interface Set<T> extends Index<T> {

}
