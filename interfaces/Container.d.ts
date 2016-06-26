
export interface Container<T> {
  add(el: T)
  remove(el: T)
  has(el: T): boolean
}

