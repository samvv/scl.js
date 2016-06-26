
/**
 * A bag is much like a set, in that no order is specified on the underlying
 * elements, but contrary to a set it can hold multiple values of the same
 * kind.
 */
export class Bag<T> {

  elements: T[] = []

  add(el: T) { 
    this.elements.push(el)
  }

  remove(el: T) {
    let idx = this.elements.indexOf(el)
    if (idx === -1)
      throw new Error(`element ${el} not found in bag`)
    this.elements.splice(idx, 1)
    while ((idx = this.elements.indexOf(el)) !== -1)
      this.elements.splice(idx, 1)
  }

  has(el: T) {
    return this.elements.indexOf(el) !== -1
  }

}


