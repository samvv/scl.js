
import { Dict } from "../../interfaces"
import { expect } from "chai"

export function addDictTests(create: () => Dict<any, any>) {
 
  it('can add an element on the given key', () => {
    const c = create()
    c.add(['a', 1])
    expect(c.getValue('a')).to.equal(1)
    c.add(['b', 2])
    expect(c.getValue('b')).to.equal(2)
    c.add(['c', 3])
    expect(c.getValue('c')).to.equal(3)
  })

  it('can remove elements', () => {
    const d = create()
    const p1 = d.add(['a', 1])
    const p2 = d.add(['b', 2])
    expect(d.has(['a', 1])).to.be.true
    expect(d.has(['b', 2])).to.be.true
    d.deleteAt(p1);
    expect(d.has(['a', 1])).to.be.false
    expect(d.has(['b', 2])).to.be.true
  })

}

export default addDictTests
