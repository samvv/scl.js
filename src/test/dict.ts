
import { Dict } from "../interfaces"
import { expect } from "chai"
import { forEachTestSet } from "./_common"
import { DictMode } from "../util"

function addTests(create) {


  it('reports the correct size', () => {
    const d = create();
    expect(d.size()).to.equal(0);
    d.add([1, 2]);
    expect(d.size()).to.equal(1);
    d.add([2, 3]);
    expect(d.size()).to.equal(2);
    d.deleteKey(1);
    expect(d.size()).to.equal(1);
  })

  it('correctly reports whether a pair is there', () => {
    const d = create();
    const p1 = [1, 2];
    const p2 = [3, 4]
    d.add(p1);
    d.add(p2);
    expect(d.has(p1)).to.be.true;
    expect(d.has(p1)).to.be.true;
    expect(d.has([3, 2])).to.be.false;
    expect(d.has([1, 4])).to.be.false;
    expect(d.has([5, 6])).to.be.false;
  });

  it('correctly reports whether a key is there', () => {
    const d = create();
    const p1 = [1, 2];
    const p2 = [3, 4]
    d.add(p1);
    d.add(p2);
    expect(d.hasKey(1)).to.be.true;
    expect(d.hasKey(2)).to.be.false;
    expect(d.hasKey(3)).to.be.true;
    expect(d.hasKey(4)).to.be.false;
  });

}

export function addSingleTests(create) {

  addTests(create);

  it('replaces the value when keys are the same', () => {
    const d = create();
    d.add([1, 2]);
    d.add([1, 3]);
    expect(d.getValue(1)).to.deep.equal(3);
  });

}

export function addMDictTests(create) {

  addTests(create)

  it('can return a view of all values for a key', () => {
    const d = create();
    d.add([1, 1]);
    d.add([1, 3]);
    d.add([1, 4]);
    d.add([2, 3]);
    d.add([4, 5]);
    expect([...d.getValues(1)].sort((a, b) => a - b)).to.deep.equal([1, 3, 4]);
  });

}

export function addManyTests(create) {

  addMDictTests(create);

  it('can hold only one of the same pair', () => {
    const d = create();
    d.add([1, 2]);
    d.add([1, 2]);
    expect([...d.getValues(1)]).to.deep.equal([2]);
  });

  it('replaces the pair when they are equal', () => {
    const d = create();
    d.add([1, 2]);
    const p2 = [1, 2];
    d.add(p2);
    expect([...d.equalKeys(1)][0]).to.equal(p2);
  });

}

export function addMultiTests(create) {

  addMDictTests(create);

  it('can hold many of the same pair', () => {
    const d = create();
    d.add([1, 2]);
    d.add([1, 2]);
    expect([...d.getValues(1)]).to.deep.equal([2, 2]);
  });

}

