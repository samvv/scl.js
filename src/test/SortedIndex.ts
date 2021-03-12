
import { expect } from "chai";
import { test } from "./_helpers"
import { SortedIndex } from "../interfaces";

import numbers1 from "./data/numbers1.json"
import { Newable, ResolveAction } from "../util";
import { checkInvariants } from "./invariants";

test<SortedIndex<number>>("SortedIndex.add() stores elements in the correct order", index => {
  index.add(1);
  index.add(5);
  index.add(2);
  index.add(3);
  index.add(4);
  expect([...index]).to.deep.equal([1, 2, 3, 4, 5]);
});

test<SortedIndex<number>>("SortedIndex.toRange() can reverse-iterate over elements in the correct sorted order", index => {
  index.add(1);
  index.add(5);
  index.add(2);
  index.add(3);
  index.add(4);
  expect([...index.toRange().reverse!()]).to.deep.equal([5, 4, 3, 2, 1]);
});

test<SortedIndex<number>>("SortedIndex.delete() deletes elements while retaining order", index => {
  index.add(1);
  index.add(5);
  index.add(2);
  index.add(3);
  index.add(4);
  expect([...index]).to.deep.equal([1, 2, 3, 4, 5]);
  index.delete(4);
  expect([...index]).to.deep.equal([1, 2, 3, 5]);
  index.delete(1);
  expect([...index]).to.deep.equal([2, 3, 5]);
  index.delete(2);
  expect([...index]).to.deep.equal([3, 5]);
  index.delete(3);
  expect([...index]).to.deep.equal([5]);
  index.delete(5);
  expect([...index]).to.deep.equal([]);
});

test<SortedIndex<number>>("SortedIndex.getGreatestLowerBound() finds the lower bound of an existing key", index => {
  index.add(1);
  index.add(5);
  index.add(2);
  index.add(3);
  index.add(4);
  const pos1 = index.getGreatestLowerBound(1);
  expect(pos1!.value).to.equal(1);
  const pos2 = index.getGreatestLowerBound(2);
  expect(pos2!.value).to.equal(2);
  const pos3 = index.getGreatestLowerBound(3);
  expect(pos3!.value).to.equal(3);
  const pos4 = index.getGreatestLowerBound(4);
  expect(pos4!.value).to.equal(4);
  const pos5 = index.getGreatestLowerBound(5);
  expect(pos5!.value).to.equal(5);
});

test<SortedIndex<number>>("SortedIndex.getLeastUpperBound() finds the upper bound of an existing key", index => {
  index.add(1);
  index.add(5);
  index.add(2);
  index.add(3);
  index.add(4);
  const pos1 = index.getLeastUpperBound(1);
  expect(pos1!.value).to.equal(1);
  const pos2 = index.getLeastUpperBound(2);
  expect(pos2!.value).to.equal(2);
  const pos3 = index.getLeastUpperBound(3);
  expect(pos3!.value).to.equal(3);
  const pos4 = index.getLeastUpperBound(4);
  expect(pos4!.value).to.equal(4);
  const pos5 = index.getLeastUpperBound(5);
  expect(pos5!.value).to.equal(5);
});

test<SortedIndex<number>>("SortedIndex.getGreatestLowerBound() works on existing keys no matter where the node is located", index => {
  for (const num of numbers1) {
    index.add(num);
  }
  for (const num of numbers1) {
    const pos = index.getGreatestLowerBound(num);
    expect(pos!.value).to.equal(num);
  }
})

test<SortedIndex<number>>("SortedIndex.getLeastUpperBound() works on existing keys no matter where the node is located", index => {
  for (const num of numbers1) {
    index.add(num);
  }
  for (const num of numbers1) {
    const pos = index.getLeastUpperBound(num);
    expect(pos!.value).to.equal(num);
  }
});

test<SortedIndex<number>>("SortedIndex.getLeastUpperBound() finds the nearest upper bound if the key is not found", index => {
  index.add(1);
  index.add(3);
  index.add(6);
  index.add(8);
  index.add(11);
  index.add(15);
  const pos1 = index.getLeastUpperBound(1);
  expect(pos1!.value).to.equal(1);
  const pos2 = index.getLeastUpperBound(2);
  expect(pos2!.value).to.equal(3);
  const pos3 = index.getLeastUpperBound(3);
  expect(pos3!.value).to.equal(3);
  const pos4 = index.getLeastUpperBound(4);
  expect(pos4!.value).to.equal(6);
  const pos5 = index.getLeastUpperBound(5);
  expect(pos5!.value).to.equal(6);
  const pos6 = index.getLeastUpperBound(6);
  expect(pos6!.value).to.equal(6);
  const pos7 = index.getLeastUpperBound(7);
  expect(pos7!.value).to.equal(8);
  const pos8 = index.getLeastUpperBound(8);
  expect(pos8!.value).to.equal(8);
  const pos9 = index.getLeastUpperBound(9);
  expect(pos9!.value).to.equal(11);
  const pos10 = index.getLeastUpperBound(10);
  expect(pos10!.value).to.equal(11);
  const pos11 = index.getLeastUpperBound(11);
  expect(pos11!.value).to.equal(11);
  const pos12 = index.getLeastUpperBound(12);
  expect(pos12!.value).to.equal(15);
  const pos13 = index.getLeastUpperBound(13);
  expect(pos13!.value).to.equal(15);
  const pos14 = index.getLeastUpperBound(14);
  expect(pos14!.value).to.equal(15);
  const pos15 = index.getLeastUpperBound(15);
  expect(pos15!.value).to.equal(15);
  const pos16 = index.getLeastUpperBound(16);
  expect(pos16).to.be.null
});

test<SortedIndex<number>>("SortedIndex.getGreatestLowerBound() finds the nearest lower bound if the key is not found", index => {
  index.add(1);
  index.add(3);
  index.add(6);
  index.add(8);
  index.add(11);
  index.add(15);
  const pos1 = index.getGreatestLowerBound(1);
  expect(pos1!.value).to.equal(1);
  const pos2 = index.getGreatestLowerBound(2);
  expect(pos2!.value).to.equal(1);
  const pos3 = index.getGreatestLowerBound(3);
  expect(pos3!.value).to.equal(3);
  const pos4 = index.getGreatestLowerBound(4);
  expect(pos4!.value).to.equal(3);
  const pos5 = index.getGreatestLowerBound(5);
  expect(pos5!.value).to.equal(3);
  const pos6 = index.getGreatestLowerBound(6);
  expect(pos6!.value).to.equal(6);
  const pos7 = index.getGreatestLowerBound(7);
  expect(pos7!.value).to.equal(6);
  const pos8 = index.getGreatestLowerBound(8);
  expect(pos8!.value).to.equal(8);
  const pos9 = index.getGreatestLowerBound(9);
  expect(pos9!.value).to.equal(8);
  const pos10 = index.getGreatestLowerBound(10);
  expect(pos10!.value).to.equal(8);
  const pos11 = index.getGreatestLowerBound(11);
  expect(pos11!.value).to.equal(11);
  const pos12 = index.getGreatestLowerBound(12);
  expect(pos12!.value).to.equal(11);
  const pos13 = index.getGreatestLowerBound(13);
  expect(pos13!.value).to.equal(11);
  const pos14 = index.getGreatestLowerBound(14);
  expect(pos14!.value).to.equal(11);
  const pos15 = index.getGreatestLowerBound(15);
  expect(pos15!.value).to.equal(15);
  const pos16 = index.getGreatestLowerBound(16);
  expect(pos16!.value).to.equal(15);
});

test("new SortedIndex.add() can store multiple equal keys", (Index: Newable<SortedIndex<number>>) => {
  const index = new Index({
    onDuplicateElements: ResolveAction.Insert,
    onDuplicateKeys: ResolveAction.Insert,
  });
  index.add(1);
  index.add(5);
  index.add(2);
  index.add(3);
  index.add(3);
  index.add(3);
  index.add(4);
  expect([...index]).to.deep.equal([1, 2, 3, 3, 3, 4, 5]);
});

test("new SortedIndex.add() can handle lots of elements with the same key", (Index: Newable<SortedIndex<number>>) => {
  const index = new Index({
    onDuplicateElements: ResolveAction.Insert,
    onDuplicateKeys: ResolveAction.Insert,
  });
  index.add(1);
  index.add(1);
  index.add(1);
  index.add(1);
  index.add(1);
  index.add(1);
  index.add(1);
  index.add(1);
  index.add(1);
  index.add(1);
  index.add(1);
  index.add(1);
  index.add(1);
  index.add(1);
  index.add(1);
  index.add(1);
  index.add(1);
  checkInvariants(index);
  const elements = [...index]
  expect(elements).to.have.lengthOf(17)
  expect(elements.every(num => num === 1)).to.be.true
});

test("new SortedIndex.equalKeys() returns a range with only keys that are the same", (Index: Newable<SortedIndex<number>>) => {
  const index = new Index({
    onDuplicateElements: ResolveAction.Insert,
    onDuplicateKeys: ResolveAction.Insert,
  });
  index.add(1);
  index.add(2);
  index.add(3);
  index.add(3);
  index.add(3);
  index.add(4);
  index.add(5);
  expect([...index.equalKeys!(7)]).to.deep.equal([]);
  expect([...index.equalKeys!(3)]).to.deep.equal([3, 3, 3]);
})
