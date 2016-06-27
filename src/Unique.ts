
import { expect } from "chai"
import { UnorderedContainer } from "../interfaces/UnorderedContainer"

export function addGenericUniquenessTests(createEmptyContainer: () => UnorderedContainer<any>) {
  
  it('cannot add the same element multiple times', () => {
    const c = createEmptyContainer()
    c.add(1)
    expect(() => c.add(1)).to.throw(Error)
  })

}

