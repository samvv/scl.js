
import { OrderedContainer } from "../../interfaces"
import { expect } from "chai"
import { getPosAt } from "../iterator"

function addOrderedTests(create : () => OrderedContainer<any>) { 

  it('can prepend elements', () => {
    const c = create()
    c.prepend('a');
    c.prepend('b')
    c.prepend('c')
    expect([...c]).to.deep.equal(['c', 'b', 'a'])
  })

  it('can append elements', () => {
    const c = create()
    c.append('a')
    c.append('b')
    c.append('c')
    expect([...c]).to.deep.equal(['a', 'b', 'c'])
  })

  it('can get an element at the given position', () => {
    const c = create()
    c.append('a')
    c.append('b')
    c.append('c')
    expect(c.at(0).value).to.equal('a')
    expect(c.at(1).value).to.equal('b')
    expect(c.at(2).value).to.equal('c')
  })

  it('can insert elements before a given position', () => {
    const c = create()
    c.append('a')
    c.append('b')
    c.append('c')
    const pos = c.at(1)
    expect(pos.value).to.equal('b')
    c.insertBefore(pos, 'd')
    expect([...c]).to.deep.equal(['a', 'd', 'b', 'c'])
  })

  it('can insert elements after a given position', () => {
    const c = create()
    c.append('a')
    c.append('b')
    c.append('c')
    const pos = c.at(1)
    expect(pos.value).to.equal('b')
    c.insertAfter(pos, 'd')
    expect([...c]).to.deep.equal(['a', 'b', 'd', 'c'])
  })

  it('can get the first element', () => {
    const c = create()
    c.append('a')
    c.append('b')
    c.append('c')
    expect(c.first()).to.equal('a')
  })

  it('can get the last element', () => {
    const c = create()
    c.append('a')
    c.append('b')
    c.append('c')
    expect(c.last()).to.equal('c')
  })

  it('reports the correct size', () => {
    const c = create()
    expect(c.size()).to.equal(0)
    c.append('a')
    expect(c.size()).to.equal(1)
    c.prepend('b')
    c.append('c')
    expect(c.size()).to.equal(3)
    const pos = c.at(1)
    c.insertAfter(pos, 'd')
    expect(c.size()).to.equal(4)
  })

  it('generates the full sequence when starting from the beginning', () => {
    const c = create();
    c.append('a');
    c.append('b');
    c.append('c');
    c.append('d');
    const it = c.begin();
    expect([...it]).to.deep.equal(['a','b','c','d']);
  });

  it('can iterate full container step-by-step when starting from the beginning', () => {
    const c = create();
    c.append('a');
    c.append('b');
    c.append('c');
    c.append('d');
    const r1 = c.begin();
    expect(r1.value).to.equal('a');
    const r2 = r1.next();
    expect(r2.value).to.equal('b');
    const r3 = r2.next();
    expect(r3.value).to.equal('c');
    const r4 = r3.next();
    expect(r4.value).to.equal('d');
    const r5 = r4.next();
    expect(r5).to.be.null;
  });

  it('can delete an element at the given position', () => {
    const c = create();
    c.append('a');
    c.append('b');
    c.append('c');
    c.append('d');
    const pos = c.at(1);
    c.deleteAt(pos);
    expect([...c]).to.deep.equal(['a', 'c', 'd']);
  });

  it('cannot get the first element when the container is empty', () => {
    const c = create()
    expect(() => c.first()).to.throw(`container is empty`)
  })

  it('cannot get the last element when the container is empty', () => {
    const c = create()
    expect(() => c.last()).to.throw(`container is empty`)
  })

  it('can clear the container', () => {
    const c = create()
    c.append('a')
    c.append('b')
    c.append('c')
    expect(c.size()).to.equal(3)
    c.clear()
    expect(c.size()).to.equal(0)
  })

}

export default addOrderedTests

