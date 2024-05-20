
import { expect } from "chai";
import { test } from "./_helpers.js"
import { Index } from "../interfaces.js";
import { checkInvariants } from "./invariants.js";
import { Newable, ResolveAction } from "../util.js";

import numbers1 from "./data/numbers1.json" with { "type": "json" };
import numbers2 from "./data/numbers2.json" with { "type": "json" };

test<Index<number>>("Index.add() correctly reports the element added on some random numbers", index => {
  for (const num of numbers1) {
    expect(index.has(num)).to.be.false
    index.add(num);
    expect(index.has(num)).to.be.true
    checkInvariants(index);
  }
});

test<Index<number>>("Index.add() correctly reports the element added on an increasing sequence", index => {
  for (let num = 0; num < 100; num++) {
    expect(index.has(num)).to.be.false
    index.add(num);
    expect(index.has(num)).to.be.true
    checkInvariants(index);
  }
});

test<Index<number>>("Index.add() correctly reports the element added on an decreasing sequence", index => {
  for (let num = 100; num >= 0; num--) {
    expect(index.has(num)).to.be.false
    index.add(num);
    expect(index.has(num)).to.be.true
    checkInvariants(index);
  }
})

test("new Index.add() throws an error if duplicate keys are not allowed and the same key is added twice", (Index: Newable<Index<[number, number]>>) => {
  const index = new Index({
    onDuplicateElement: ResolveAction.Error,
    onDuplicateKey: ResolveAction.Error,
  });
  const e1: [number, number] = [1, 1];
  const e2: [number, number] = [1, 2];
  const e3: [number, number] = [1, 3];
  const e4: [number, number] = [1, 4];
  const e5: [number, number] = [1, 5];
  const e6: [number, number] = [2, 1];
  const e7: [number, number] = [2, 2];
  const e8: [number, number] = [2, 3];
  const e9: [number, number] = [2, 4];
  const e10: [number, number] = [2, 5];
  index.add(e1);
  expect(index.has(e1)).to.be.true;
  expect(() => { index.add(e2) }).to.throw(Error);
  expect(index.has(e2)).to.be.false;
  expect(() => { index.add(e3) }).to.throw(Error);
  expect(index.has(e3)).to.be.false;
  expect(() => { index.add(e4) }).to.throw(Error);
  expect(index.has(e4)).to.be.false;
  expect(() => { index.add(e5) }).to.throw(Error);
  expect(index.has(e5)).to.be.false;
  index.add(e6);
  expect(index.has(e6)).to.be.true;
  expect(() => { index.add(e7) }).to.throw(Error);
  expect(index.has(e7)).to.be.false;
  expect(() => { index.add(e8) }).to.throw(Error);
  expect(index.has(e8)).to.be.false;
  expect(() => { index.add(e9) }).to.throw(Error);
  expect(index.has(e9)).to.be.false;
  expect(() => { index.add(e10) }).to.throw(Error);
  expect(index.has(e10)).to.be.false;
})

test<Index<number>>("Index.delete() correctly reports the element deleted on some random numbers", index => {
  for (const num of numbers1) {
    index.add(num);
  }
  checkInvariants(index);
  for (const num of numbers2) {
    expect(index.has(num)).to.be.true
    index.delete(num);
    expect(index.has(num)).to.be.false
    checkInvariants(index);
  }
});
