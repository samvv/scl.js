
/**
 * Compatible with ES6 definition of the <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols">iterator protocol</a>.
 */
export interface IteratorResult<T> {
  done: boolean
  value: T
  delete?(): void
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

