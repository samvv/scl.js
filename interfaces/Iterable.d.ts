
/// <reference path="../typings/index.d.ts" />

export interface Iterator<T> {
  next(): { done: boolean, value?: T }
}

export interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>
}

