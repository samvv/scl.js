
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
   * Returns an object which is able to sift through the values in this container.
   *
   * One iterator is guaranteed to loop over its elements in the same order
   * that it was created. However, different iterators are not guaranteed to
   * produce the same order. See {@link OrderedContainer} if you need a
   * container that does provide this guarantee.
   */
  [Symbol.iterator](): Iterator<T>

  /**
   * @deprecated
   */
  iterator?(): Iterator<T> 

  /**
   * Count the amount of elements in the container. In most cases, this should
   * be an O(1) operation.
   */
  size(): number

  /**
   * Remove all elements from this container, effectively setting the container
   * to the empty state.
   */
  clear()

  clone?()

  /**
   * Remove the element pointed to by the iterator result from this container.
   */
  deleteAt(pos: Cursor<T>): void;

}

/**
 * Represents any container that has an order defined on its elements.
 */
export interface OrderedContainer<T> extends Container<T> {

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
   * Append an item at the end of the container. The element will be given the
   * highest order.
   */
  append(el: T): Cursor<T>;

  /**
   * Prepend an item to the beginning of the container. The element will be
   * given the lowest order.
   */
  prepend(el: T): Cursor<T>;

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
  begin(): Cursor<T>

  /**
   * Return an iterator that is initially placed at the highest element in the container.
   */
  end(): Cursor<T>

  /**
   * Return an iterator that is places at the element which is the Nth element
   * in the ascending row leading up to element.
   */
  at(position: number): Cursor<T>

  /**
   * Allows taking a direct reference to a value in the container at a given
   * indexed position, without the need for constructing iterators and iterator
   * results.
   */
  ref?(position: number): T

}

/**
 * Represents a container that explicitly has no order defined on its elements.
 */
export interface UnorderedContainer<T> extends Container<T> {

  /**
   * Add an element to the container. The element is place where the container
   * sees fit.
   */
  add(el: T): Cursor<T>;

  /**
   * Remove an element from the container. If multiple elements are matched,
   * the container picks one of them.
   */
  delete(el: T);

  equal?(el: T): View<T>;

  lower?(el: T): Cursor<T>;

  upper?(el: T): Cursor<T>;

}

/**
 * A container that never contains multiple occurrences of the same element.
 */
export interface UniqueContainer<T> extends Container<T> { 

} 

/**
 * Represents any container which can contain multiple elements of the same
 * kind.
 */
export interface MultiContainer<T> extends Container<T> {

  /**
   * Count all elements which belong to the same kind as the element being
   * passed in.
   *
   * @deprecated
   */
  count?(el: T): number

  /**
   * Remove all occurrences of the given element in the container, possibly
   * doing nothing in the case there are no elements to be removed.
   *
   * @deprecated
   */
  deleteAll?(el: T)

}

/**
 * Cursors correspond to what are called 'iterators' in most other languages.
 * It is not to be confused with JavaScript iterators, which change their own
 * state when a new result value is requested.
 */
export interface Cursor<T> {

  /**
   * A reference to the element pointed to by this cursor, as it was inserted
   * into the container.
   */
  value: T;

  /**
   * Generates the sequence of all subsequent elements as ordered by the container.
   */
  [Symbol.iterator](): Iterator<T>;

  /**
   * Get a reference to the cursor that is immediately after this one's, as
   * defined by the container's order.
   */
  next(): Cursor<T>;

  /**
   * Get a reference to the cursor that is immediately before to this one's, as
   * defined by the container's order.
   */
  prev(): Cursor<T>;

}

/**
 * A view represents a customised order on (a subset of) the elements of a container.
 */
export interface View<T> {

  /**
   * Reverse the order of the elements that would be generated with the
   * iterator.
   */
  reverse(): View<T>;

  /**
   * Get an iterator that sequences the elements contained in this cursor.
   */
  [Symbol.iterator](): Iterator<T>;

}

/**
 * A bag is much like a set, in that no order is specified on the underlying
 * elements, but contrary to a set it can hold multiple values of the same
 * kind.
 */
export interface Bag<T> extends UnorderedContainer<T>, MultiContainer<T> {

}

/**
 * Simple sugar for an array-based pair. Used by dictionaries to denote the
 * actual value that is stored in the container.
 */
export type Pair<K, V> = [K, V]

/**
 * A dictionary, also known as 'maps' in other languages, associates a certain
 * value (called the key) with another value, providing efficient lookup of the
 * value when given the key.
 */
export interface Dict<K, V> extends UniqueContainer<Pair<K, V>>, UnorderedContainer<Pair<K, V>> {

  /**
   * Creates a new pair and inserts it in the underlying container.
   */
  emplace(key: K, value: V)

  /**
   * Checks whether there a pair in this container that has the given
   * key. In some cases, this might be faster than a `count`-operation. In
   * others, it will be equivalent to it.
   */
  hasKey(key: K): boolean

  /**
   * Get the value that is associated with the given key.
   */
  getValue(key: K): V

  /**
   * Delete a pair from the underlying container that has the given key as key.
   */
  deleteKey(key: K): void

}

type Vec2 = [number, number]

export interface Grid<T> {
  width: number
  height: number
  get([x,y]: Vec2): T
  set([x,y]: Vec2, val: T): void
  delete([x,y]: Vec2): void
  has([x,y]: Vec2): boolean
}

export interface MinHeap<T> extends UnorderedContainer<T> {
  min(): T
  deleteMin()
}

export interface MaxHeap<T> extends UnorderedContainer<T> {
  min(): T
  deleteMin()
}

/**
 * A list is a positional container which can contain multiple elements of the
 * same kind. 
 *
 * A list is characterized by low-cost insertion of elements, while
 * referencing an element at a given position is generally slower.
 */
export interface List<T> extends MultiContainer<T>, OrderedContainer<T> {

  /**
   * Get the rest of the list. This operation usually is in $O(1)$.
   */
  rest(): List<T>

}

/**
 * A `MultiDict` is much like a `Dict`, except that one key can be associated
 * with many values.
 */
export interface MultiDict<K, V> extends MultiContainer<Pair<K, V>>, UnorderedContainer<Pair<K, V>> {

  /**
   * Checks whether there is any pair in the underlying container that has the
   * given value as key. In some cases, this might be faster than a `count`-operation. In
   * others, it will be equivalent to it.
   */
  hasKey(key: K, value?: V): boolean;

  /**
   * Returns a number indicating how many pairs the underlying container has
   * with the given key.
   */
  countKeys(key: K);

  /**
   * Get all values that are associated with the given key.
   */
  getValues(key: K): V[];

  /**
   * Removes all pairs with the given key from the container. 
   */
  deleteKeys(key: K): void

}

/**
 * Queuelike structures hold their data in an order that is determined by the
 * structure itself rather than the end-user.
 *
 * The order the queuelike structure keeps track of its data is always of
 * significance to the user. This is contrary to the order with which
 * dictionaries and sets keep track of data, which does not matter to the end
 * user.
 */
export interface Queuelike<T> extends UnorderedContainer<T>, MultiContainer<T> {
  /**
   * Gets the next element in the order of the queue and removes it from the container.
   *
   * This method is very similar to `first()` except that it mutates the container.
   */
  dequeue(): T
}

export interface Set<T> extends UnorderedContainer<T>, UniqueContainer<T> {

}

/**
 * A vector is a positional container which can contain multiple elements of
 * the same kind. A vector is characterized by low-cost lookup of elements at a
 * given position, while inserting elements at a given position is generally
 * slower
 */
export interface Vector<T> extends MultiContainer<T>, OrderedContainer<T> { 
  /**
   * Allocates the specified amount of free space at the end of the vector for
   * storing data, without changing its `size()`.
   */
  allocate?(amnt: number)

  replace(pos: number, newEl: T): void;

  setSize(size: number);
}

