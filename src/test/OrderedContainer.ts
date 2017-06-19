
import { OrderedContainer } from "../../interfaces"
import { expect } from "chai"

export default function addGenericOrderedContainerTests(createEmptyOrderedContainer: () => OrderedContainer<any>) {

  it('correctly appends elements', () => {

    const c = createEmptyOrderedContainer()

    expect(c.has(1)).to.be.false
    c.append(1)
    expect(c.has(1)).to.be.true
    expect(c.first()).to.equal(1)
    expect(c.last()).to.equal(1)

    expect(c.has(2)).to.be.false
    c.append(2)
    expect(c.has(2)).to.be.true
    expect(c.first()).to.not.equal(2)
    expect(c.last()).to.equal(2)
  })

  it('correctly prepends elements', () => {

    const c = createEmptyOrderedContainer()

    expect(c.has(1)).to.be.false
    c.prepend(1)
    expect(c.has(1)).to.be.true
    expect(c.first()).to.equal(1)
    expect(c.last()).to.equal(1)

    expect(c.has(2)).to.be.false
    c.prepend(2)
    expect(c.has(2)).to.be.true
    expect(c.first()).to.equal(2)
    expect(c.last()).to.not.equal(2)
  })

  it('can insert an element', () => {
    const c = createEmptyOrderedContainer()
    c.append(1)
    c.append(2)
    c.append(4)
    expect(c.has(3)).to.be.false
    const it = c.begin()
    it.nextN(2)
    c.insert(it, 3)
    expect(c.has(3)).to.be.false
  })

  it('inserts an element on the right place', () => {
    
  })
}

