
import { Bag } from "../../interfaces"
import { expect } from "chai"

export default function addGenericBagTests(createEmptyBag: () => Bag<any>) {

  it('reports a numeric value to be added if we add a numeric value', () => {
    const bag = createEmptyBag()
    bag.add(1)
    expect(bag.has(1)).to.be.true
  })

  it('does not report numeric values to be present which were no added', () => {
    const bag = createEmptyBag()
    expect(bag.has(1)).to.be.false
    expect(bag.has(2)).to.be.false
    expect(bag.has(3)).to.be.false
    bag.add(1)
    bag.add(3)
    expect(bag.has(2)).to.be.false
  })

  it('removes all of the occurrences of a given element', () => {
    const bag = createEmptyBag()
    bag.add(1)
    bag.add(2)
    bag.add(3)
    bag.add(2)
    expect(bag.has(2)).to.be.true
    bag.remove(2)
    expect(bag.has(2)).to.be.true
    bag.remove(2)
    expect(bag.has(2)).to.be.false
  })

}

