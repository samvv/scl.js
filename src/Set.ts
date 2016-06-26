
export class Set<T> implements Set<T> {

  elements: Object

  add(el: T) {
    if (this.elements[el])
      throw new Error(`set already contains element: ${el}`)
    this.elements[el] = true
  }

  remove(el: T) {
    if (!this.elements[el])
      throw new Error(`set does not contain element: ${el}`)
    delete this.elements[el] 
  }

  has(el: T): boolean {
    return !!this.elements[el]
  }

}

