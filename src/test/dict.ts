
import { DictLike, Dict, MultiDict } from "../interfaces"
import { expect } from "chai"
import { test } from "./_helpers"

test('DictLike.size increases its size when new entries are added', (dict: DictLike<number, number>) => {
  expect(dict.size).to.equal(0);
  dict.add([1, 2]);
  expect(dict.size).to.equal(1);
  dict.add([2, 3]);
  expect(dict.size).to.equal(2);
  dict.deleteKey(1);
  expect(dict.size).to.equal(1);
})

test('DictLike.has() correctly reports whether a pair is there', (dict: DictLike<number, number>) => {
  dict.add([1, 2]);
  dict.add([3, 4]);
  expect(dict.has([1, 2])).to.be.true;
  expect(dict.has([3, 4])).to.be.true;
  expect(dict.has([3, 2])).to.be.false;
  expect(dict.has([1, 4])).to.be.false;
  expect(dict.has([5, 6])).to.be.false;
});

test('DictLike.hasKey() correctly reports whether a key is there', (dict: DictLike<number, number>) => {
  dict.add([1, 2]);
  dict.add([3, 4]);
  expect(dict.hasKey(1)).to.be.true;
  expect(dict.hasKey(2)).to.be.false;
  expect(dict.hasKey(3)).to.be.true;
  expect(dict.hasKey(4)).to.be.false;
  expect(dict.hasKey(5)).to.be.false;
});

test('DictLike.clear() clear the entire dictionary', (dict: DictLike<number, number>) => {
  dict.add([1, 2]);
  dict.add([3, 4]);
  dict.add([5, 6]);
  dict.add([7, 8]);
  expect(dict.size).to.equal(4);
  dict.clear();
  expect(dict.size).to.equal(0);
  expect([...dict]).to.deep.equal([]);
});

test('DictLike.toRange().size returns the correct size', (dict: DictLike<number, number>) => {
  expect(dict.size).to.equal(0);
  expect(dict.toRange().size).to.equal(0);
  dict.add([1, 2]);
  expect(dict.size).to.equal(1);
  expect(dict.toRange().size).to.equal(1);
  dict.add([3, 4]);
  expect(dict.size).to.equal(2);
  expect(dict.toRange().size).to.equal(2);
});

test('DictLike.delete() deletes at most one element', (dict: DictLike<number, number>) => {
  dict.add([1, 2]);
  dict.add([3, 2]);
  expect(dict.size).to.equal(2);
  expect(dict.delete([1, 2])).to.be.true;
  expect(dict.size).to.equal(1);
  expect([...dict]).to.deep.equal([[3, 2]]);
});

test('DictLike.delete() does not accidentally delete the wrong element', (dict: DictLike<number, number>) => {
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


test('Dict.emplace() replaces the value when keys are the same', (dict: Dict<number, number>) => {
  const res1 = dict.emplace(1, 2);
  expect(res1[0]).to.be.true;
  const res2 = dict.emplace(1, 3);
  expect(res2[0]).to.be.false;
  expect([...dict]).to.deep.equal([[1, 3]]);
});

test('Dict.add() replaces the value when keys are the same', (dict: Dict<number, number>) => {
  dict.add([1, 2]);
  dict.add([1, 3]);
  expect([...dict]).to.deep.equal([[1, 3]]);
});

test('Dict.getValue() returns the correct value for a given element', (dict: Dict<number, number>) => {
  dict.add([1, 2]);
  dict.add([3, 4]);
  expect(dict.getValue(1)).to.equal(2);
  expect(dict.getValue(3)).to.equal(4);
});

test('Dict.getValue() throws an error if the value is not there', (dict: Dict<number, number>) => {
  dict.add([1, 2]);
  dict.add([3, 4]);
  expect(() => dict.getValue(5)).to.throw(Error);
  expect(() => dict.getValue(2)).to.throw(Error);
  expect(() => dict.getValue(4)).to.throw(Error);
});

test('ManyDict.add() only allows one element of the same key and value', (dict: MultiDict<number, number>) => {
  const res1 = dict.add([1, 2]);
  expect(res1[0]).to.be.true;
  const res2 = dict.add([1, 2]);
  expect(res2[0]).to.be.false;
  expect([...dict]).to.deep.equal([[1, 2]]);
});

test('ManyDict.add() replaces pairs of the same key and value', (dict: MultiDict<number, number>) => {
  const p1: [number, number] = [1, 2];
  dict.add(p1);
  const p2: [number, number] = [1, 2];
  dict.add(p2);
  const elements = [...dict];
  expect(elements).to.have.lengthOf(1);
  expect(elements[0]).to.not.equal(p1);
  expect(elements[0]).to.equal(p2);
});

test('ManyDict.emplace() only allows one element of the same key and value', (dict: MultiDict<number, number>) => {
  const res1 = dict.add([1, 2]);
  expect(res1[0]).to.be.true;
  const res2 = dict.add([1, 2]);
  expect(res2[0]).to.be.false;
  expect([...dict]).to.deep.equal([[1, 2]]);
});

test('ManyDict.emplace() replaces pairs of the same key and value', (dict: MultiDict<number, number>) => {
  const res1 = dict.emplace(1, 2);
  const val1 = res1[1].value;
  expect(res1[0]).to.be.true;
  const res2 = dict.emplace(1, 2);
  const val2 = res2[1].value;
  expect(res2[0]).to.be.false;
  const elements = [...dict];
  expect(elements).to.have.lengthOf(1);
  expect(elements[0]).to.not.equal(val1);
  expect(elements[0]).to.equal(val2);
});

test('ManyDict.getValues() correctly returns all values for a key', (dict: MultiDict<number, number>) => {
  dict.add([1, 1]);
  dict.add([1, 3]);
  dict.add([1, 3]);
  dict.add([1, 4]);
  dict.add([2, 3]);
  dict.add([4, 5]);
  expect([...dict.getValues(1)].sort((a, b) => a - b)).to.deep.equal([1, 3, 4]);
});

test('MultiDict.add() allows adding pairs of the same key and value', (dict: MultiDict<number, number>) => {
  const res1 = dict.add([1, 2]);
  expect(res1[0]).to.be.true;
  const res2 = dict.add([1, 2]);
  expect(res2[0]).to.be.true;
  expect([...dict]).to.deep.equal([[1, 2], [1, 2]]);
});

test('MultiDict.emplace() allows adding pairs of the same key and value', (dict: MultiDict<number, number>) => {
  const res1 = dict.emplace(1, 2);
  expect(res1[0]).to.be.true;
  const res2 = dict.emplace(1, 2);
  expect(res2[0]).to.be.true;
  expect([...dict]).to.deep.equal([[1, 2], [1, 2]]);
});

test('MultiDict.getValues() correctly returns all values for a key', (dict: MultiDict<number, number>) => {
  dict.add([1, 1]);
  dict.add([1, 3]);
  dict.add([1, 3]);
  dict.add([1, 4]);
  dict.add([2, 3]);
  dict.add([4, 5]);
  expect([...dict.getValues(1)].sort((a, b) => a - b)).to.deep.equal([1, 3, 3, 4]);
});

