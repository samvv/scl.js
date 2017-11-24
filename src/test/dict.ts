
import { Dict } from "../interfaces"
import { expect } from "chai"
import { forEachTestSet } from "./_common"
import { DictMode } from "../util"

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

  forEachTestSet((ins, outs, i) => {
    it(`works on test set ${i}`, () => {
      const d = create();
      for (const n of ins)  {
        d.add([n, n+1]);
      }
      for (const n of outs) {
        d.deleteKey([n, n+1]);
      }
    });
  });

}

export function addSingleTests(create) {
  it('can hold only one of the same key', () => {
    const d = create();
    d.add([1, 2]);
    d.add([1, 3]);
    expect([...d]).to.deep.equal([[1, 3]]);
  });
}

export function addManyTests(create) {
  it('can hold only one of the same pair', () => {
    const d = create();
    d.add([1, 2]);
    d.add([1, 2]);
    expect([...d]).to.deep.equal([[1, 2]]);
  });
}

export function addMultiTests(create) {
  it('can hold many of the same pair', () => {
    const d = create();
    d.add([1, 2]);
    d.add([1, 2]);
    expect([...d]).to.deep.equal([[1, 2], [1, 2]]);
  });
}

export default addDictTests

