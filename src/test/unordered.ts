
import { UnorderedContainer } from "../../interfaces"
import { expect } from "chai"

export function addUnorderedTests(create: () => UnorderedContainer<any>) {
  
  it('can add elements and report them added', () => {
    const c = create()

    expect(c.has('a')).to.be.false
    c.add('a')
    expect(c.has('a')).to.be.true

    expect(c.has('b')).to.be.false
    c.add('b')
    expect(c.has('b')).to.be.true

    expect(c.has('d')).to.be.false
    c.add('d')
    expect(c.has('d')).to.be.true

  })

  it('can remove elements', () => {

    const c = create()
    c.add('a')
    c.add('b')
    c.add('d')

    expect(c.has('a')).to.be.true
    c.delete('a')
    expect(c.has('a')).to.be.false

    expect(c.has('b')).to.be.true
    c.delete('b')
    expect(c.has('b')).to.be.false

    expect(c.has('d')).to.be.true
    c.delete('d')
    expect(c.has('d')).to.be.false
  })

  it('reports the correct size', () => {
    const c = create()
    expect(c.size()).to.equal(0)
    c.add('a')
    expect(c.size()).to.equal(1)
    c.add('b')
    expect(c.size()).to.equal(2)
    c.add('c')
  })

}

export default addUnorderedTests

