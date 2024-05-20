
import { expect } from "chai";
import { DictLike } from "../interfaces.js";
import { test } from "./_helpers.js";

test<DictLike<number, number>>("DictLike.size increases its size when new entries are added", dict => {
  expect(dict.size).to.equal(0);
  dict.add([1, 2]);
  expect(dict.size).to.equal(1);
  dict.add([2, 3]);
  expect(dict.size).to.equal(2);
  dict.deleteKey(1);
  expect(dict.size).to.equal(1);
});

test<DictLike<number, number>>("DictLike.has() correctly reports whether a pair is there", dict => {
  dict.add([1, 2]);
  dict.add([3, 4]);
  expect(dict.has([1, 2])).to.be.true;
  expect(dict.has([3, 4])).to.be.true;
  expect(dict.has([3, 2])).to.be.false;
  expect(dict.has([1, 4])).to.be.false;
  expect(dict.has([5, 6])).to.be.false;
});

test<DictLike<number, number>>("DictLike.hasKey() correctly reports whether a key is there", dict => {
  dict.add([1, 2]);
  dict.add([3, 4]);
  expect(dict.hasKey(1)).to.be.true;
  expect(dict.hasKey(2)).to.be.false;
  expect(dict.hasKey(3)).to.be.true;
  expect(dict.hasKey(4)).to.be.false;
  expect(dict.hasKey(5)).to.be.false;
});

test<DictLike<number, number>>("DictLike.clear() clear the entire dictionary", dict => {
  dict.add([1, 2]);
  dict.add([3, 4]);
  dict.add([5, 6]);
  dict.add([7, 8]);
  expect(dict.size).to.equal(4);
  dict.clear();
  expect(dict.size).to.equal(0);
  expect([...dict]).to.deep.equal([]);
});

test<DictLike<number, number>>("DictLike.toRange().size returns the correct size", dict => {
  expect(dict.size).to.equal(0);
  expect(dict.toRange().size).to.equal(0);
  dict.add([1, 2]);
  expect(dict.size).to.equal(1);
  expect(dict.toRange().size).to.equal(1);
  dict.add([3, 4]);
  expect(dict.size).to.equal(2);
  expect(dict.toRange().size).to.equal(2);
});

test<DictLike<number, number>>("DictLike.delete() deletes at most one element", dict => {
  dict.add([1, 2]);
  dict.add([3, 2]);
  expect(dict.size).to.equal(2);
  expect(dict.delete([1, 2])).to.be.true;
  expect(dict.size).to.equal(1);
  expect([...dict]).to.deep.equal([[3, 2]]);
});

test<DictLike<number, number>>("DictLike.delete() does not accidentally delete the wrong element", dict => {
  dict.add([1, 3]);
  dict.add([2, 3]);
  expect(dict.size).to.equal(2);
  expect(dict.delete([3, 1])).to.be.false;
  expect(dict.size).to.equal(2);
  expect(dict.delete([2, 1])).to.be.false;
  expect(dict.size).to.equal(2);
  expect(dict.delete([3, 2])).to.be.false;
  expect(dict.size).to.equal(2);
  expect([...dict]).to.deep.include([1, 3]);
  expect([...dict]).to.deep.include([2, 3]);
});
