
/**
 * Compatible with ES6 definition of the 
 * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols">iterator protocol</a>.
 */
export interface Iterator<T> {
  /**
   * Get the next available value.
   */
  next(): { done: boolean, value?: T }
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

