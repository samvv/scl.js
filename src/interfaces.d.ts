
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
  iterator(): Iterator<T> 

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
}

/**
 * Represents any container that has an order defined on its elements.
 */
export interface OrderedContainer<T> extends Container<T> {

  /**
   * Insert an element after the element at the given position. The position is
   * deduced from the iterator that is given to the method.
   */
  insertAfter(position: IteratorResult<T>, el: T) 

  /**
   * Insert an element before the element at the given position. The position is
   * deduced from the iterator that is goven to the method.
   */
  insertBefore(position: IteratorResult<T>, el: T)

  /**
   * Append an item at the end of the container. The element will be given the
   * highest order.
   */
  append(el: T)

  /**
   * Prepend an item to the beginning of the container. The element will be
   * given the lowest order.
   */
  prepend(el: T) 


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
  begin(): Iterator<T>

  /**
   * Return an iterator that is initially placed at the highest element in the container.
   */
  end(): Iterator<T>

  /**
   * Return an iterator that is places at the element which is the Nth element
   * in the ascending row leading up to element.
   */
  at(position: number): IteratorResult<T>

  /**
   * Remove the element pointed to by the iterator result from this container.
   */
  deleteAt(pos: IteratorResult<T>): void;

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
  add(el: T)
  /**
   * Remove an element from the container. If multiple elements are matched,
   * the container picks one of them.
   */
  delete(el: T)
}

/**
 * A bag is much like a set, in that no order is specified on the underlying
 * elements, but contrary to a set it can hold multiple values of the same
 * kind.
 */
export interface Bag<T> extends UnorderedContainer<T>, MultiContainer<T> {

}


export interface UniqueContainer<T> extends Container<T> { 

} 

export type Pair<K, V> = [K, V]

export interface Dict<K, V> extends UniqueContainer<Pair<K, V>>, UnorderedContainer<Pair<K, V>> {
  addPair(key: K, value: V)
  hasKey(key: K): boolean
  hasValue(value: V): boolean
  getValue(key: K): V
  deleteKey(key: K): void
  deleteValue(value: V): void
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
 * Compatible with ES6 definition of the <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols">iterator protocol</a>.
 */
export interface IteratorResult<T> {
  done: boolean
  value: T
}

/**
 * Compatible with ES6 definition of the <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols">iterator protocol</a>.
 */
export interface Iterator<T> {
  next(value?: any): IteratorResult<T>;
  return?(value?: any): IteratorResult<T>;
  throw?(e?: any): IteratorResult<T>;
  /**
   * Get the value residing before the current one.
   */
  prev?(): { done: boolean, value?: T }
  /**
   * Skip {@param offset} values and return the next one.
   */
  nextN?(offset: number): { done: boolean, value?: T }
  /**
   * Rewind {@param offset} values and return the one before it.
   */
  prevN?(offset: number): { done: boolean, value?: T }
}

/**
 * A list is a positional container which can contain multiple elements of the
 * same kind. A list is characterized by low-cost insertion of elements, while
 * referencing an element at a given position is generally slower.
 */
export interface List<T> extends MultiContainer<T>, OrderedContainer<T> {
  rest(): List<T>
}

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
  deleteAll(el: T)
}

export interface MultiDict<K, V> extends MultiContainer<Pair<K, V>>, UnorderedContainer<Pair<K, V>> {
  hasKey(key: K): boolean
  hasValue(value: V): boolean
  getValues(key: K): V[]
  deleteKeys(key: K): void
  deleteValues(value: V): void
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
  allocate(amnt: number)

  replace(pos: number, newEl: T): void;

  setSize(size: number);
}

