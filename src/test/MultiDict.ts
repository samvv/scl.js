
import { expect } from "chai";
import { MultiDict } from "../interfaces";
import { test } from "./_helpers";

// test<MultiDict<number, number>>("ManyDict.add() only allows one element of the same key and value", dict => {
//   const res1 = dict.add([1, 2]);
//   expect(res1[0]).to.be.true;
//   const res2 = dict.add([1, 2]);
//   expect(res2[0]).to.be.false;
//   expect([...dict]).to.deep.equal([[1, 2]]);
// });

// test<MultiDict<number, number>>("ManyDict.add() replaces pairs of the same key and value", dict => {
//   const p1: [number, number] = [1, 2];
//   dict.add(p1);
//   const p2: [number, number] = [1, 2];
//   dict.add(p2);
//   const elements = [...dict];
//   expect(elements).to.have.lengthOf(1);
//   expect(elements[0]).to.not.equal(p1);
//   expect(elements[0]).to.equal(p2);
// });

// test<MultiDict<number, number>>("ManyDict.emplace() only allows one element of the same key and value", dict => {
//   const res1 = dict.add([1, 2]);
//   expect(res1[0]).to.be.true;
//   const res2 = dict.add([1, 2]);
//   expect(res2[0]).to.be.false;
//   expect([...dict]).to.deep.equal([[1, 2]]);
// });

// test<MultiDict<number, number>>("ManyDict.emplace() replaces pairs of the same key and value", dict => {
//   const res1 = dict.emplace(1, 2);
//   const val1 = res1[1].value;
//   expect(res1[0]).to.be.true;
//   const res2 = dict.emplace(1, 2);
//   const val2 = res2[1].value;
//   expect(res2[0]).to.be.false;
//   const elements = [...dict];
//   expect(elements).to.have.lengthOf(1);
//   expect(elements[0]).to.not.equal(val1);
//   expect(elements[0]).to.equal(val2);
// });

// test<MultiDict<number, number>>("ManyDict.getValues() correctly returns all values for a key", dict => {
//   dict.add([1, 1]);
//   dict.add([1, 3]);
//   dict.add([1, 3]);
//   dict.add([1, 4]);
//   dict.add([2, 3]);
//   dict.add([4, 5]);
//   expect([...dict.getValues(1)].sort((a, b) => a - b)).to.deep.equal([1, 3, 4]);
// });

test<MultiDict<number, number>>("MultiDict.add() allows adding pairs of the same key and value", dict => {
  const res1 = dict.add([1, 2]);
  expect(res1[0]).to.be.true;
  const res2 = dict.add([1, 2]);
  expect(res2[0]).to.be.true;
  expect([...dict]).to.deep.equal([[1, 2], [1, 2]]);
});

test<MultiDict<number, number>>("MultiDict.emplace() allows adding pairs of the same key and value", dict => {
  const res1 = dict.emplace(1, 2);
  expect(res1[0]).to.be.true;
  const res2 = dict.emplace(1, 2);
  expect(res2[0]).to.be.true;
  expect([...dict]).to.deep.equal([[1, 2], [1, 2]]);
});

test<MultiDict<number, number>>("MultiDict.getValues() correctly returns all values for a key", dict => {
  dict.add([1, 1]);
  dict.add([1, 3]);
  dict.add([1, 3]);
  dict.add([1, 4]);
  dict.add([2, 3]);
  dict.add([4, 5]);
  expect([...dict.getValues(1)].sort((a, b) => a - b)).to.deep.equal([1, 3, 3, 4]);
});