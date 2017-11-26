
import { Dict } from "../interfaces"
import { expect } from "chai"
import { forEachTestSet } from "./_common"
import { DictMode } from "../util"

export function addSingleTests(create) {

  it('replaces the value when keys are the same', () => {
    const d = create();
    d.add([1, 2]);
    d.add([1, 3]);
    expect(d.getValue(1).value).to.deep.equal([1, 3]);
  });

}

export function addMDictTests(create) {

  it('can return a view of all values for a key', () => {
    const d = create();
    d.add([1, 1]);
    d.add([1, 3]);
    d.add([1, 4]);
    d.add([2, 3]);
    d.add([4, 5]);
    expect([...d.getValues(1)]).to.deep.equal([1, 3, 4]);
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

