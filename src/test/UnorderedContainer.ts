
import { expect } from "chai"

import { UnorderedContainer } from "../../interfaces"

export default function addGenericUnorderedContainerTests(createEmptyUnorderedContainer: () => UnorderedContainer<any>) {

  it('can add an element', () => {
    const c = createEmptyUnorderedContainer()
    expect(c.has(1)).to.be.false
    c.add(1)
    expect(c.has(1)).to.be.true
  })

  it('can remove an added element', () => {
    const c = createEmptyUnorderedContainer()
    c.add(1)
    expect(c.has(1)).to.be.true
    c.remove(1)
    expect(c.has(1)).to.be.false
  })

  it('reports added elements to be there', () => {
    const c = createEmptyUnorderedContainer()

    expect(c.has(1)).to.be.false
    c.add(1)
    expect(c.has(1)).to.be.true

    expect(c.has(2)).to.be.false
    c.add(2)
    expect(c.has(2)).to.be.true

    expect(c.has(3)).to.be.false
    c.add(3)
    expect(c.has(3)).to.be.true
  })
  
  it('reports elements that were not added to not be there', () => {
    const c = createEmptyUnorderedContainer()
    expect(c.has(1)).to.be.false
    expect(c.has(2)).to.be.false
    expect(c.has(3)).to.be.false
    c.add(2)
    expect(c.has(1)).to.be.false
    expect(c.has(3)).to.be.false
  })
  
}

