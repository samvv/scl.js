
import { expect } from "chai";
import { test } from "./_helpers"
import { SortedIndex } from "../interfaces";

import numbers1 from "./data/numbers1.json"
import numbers2 from "./data/numbers2.json"

test<SortedIndex<number>>("SortedIndex.add() storer elements in the correct order", index => {
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

test<SortedIndex<number>>("SortedIndex.lowerKey() finds the lower bound of an existing key", index => {
  index.add(1);
  index.add(5);
  index.add(2);
  index.add(3);
  index.add(4);
  const pos1 = index.lowerKey(1);
  expect(pos1!.value).to.equal(1);
  const pos2 = index.lowerKey(2);
  expect(pos2!.value).to.equal(2);
  const pos3 = index.lowerKey(3);
  expect(pos3!.value).to.equal(3);
  const pos4 = index.lowerKey(4);
  expect(pos4!.value).to.equal(4);
  const pos5 = index.lowerKey(5);
  expect(pos5!.value).to.equal(5);
});

test<SortedIndex<number>>("SortedIndex.upperKey() finds the upper bound of an existing key", index => {
  index.add(1);
  index.add(5);
  index.add(2);
  index.add(3);
  index.add(4);
  const pos1 = index.upperKey(1);
  expect(pos1!.value).to.equal(1);
  const pos2 = index.upperKey(2);
  expect(pos2!.value).to.equal(2);
  const pos3 = index.upperKey(3);
  expect(pos3!.value).to.equal(3);
  const pos4 = index.upperKey(4);
  expect(pos4!.value).to.equal(4);
  const pos5 = index.upperKey(5);
  expect(pos5!.value).to.equal(5);
});

test<SortedIndex<number>>("SortedIndex.lowerKey() works pn existing keys no matter where the node is located", index => {
  for (const num of numbers1) {
    index.add(num);
  }
  for (const num of numbers1) {
    const pos = index.lowerKey(num);
    expect(pos!.value).to.equal(num);
  }
})

test<SortedIndex<number>>("SortedIndex.upperKey() works on existing keys no matter where the node is located", index => {
  for (const num of numbers1) {
    index.add(num);
  }
  for (const num of numbers1) {
    const pos = index.upperKey(num);
    expect(pos!.value).to.equal(num);
  }
});

test<SortedIndex<number>>("SortedIndex.upperKey() finds the nearest upper bound if the key is not found", index => {
  index.add(1);
  index.add(3);
  index.add(6);
  index.add(8);
  index.add(11);
  index.add(15);
  const pos1 = index.upperKey(1);
  expect(pos1!.value).to.equal(1);
  const pos2 = index.upperKey(2);
  expect(pos2!.value).to.equal(3);
  const pos3 = index.upperKey(3);
  expect(pos3!.value).to.equal(3);
  const pos4 = index.upperKey(4);
  expect(pos4!.value).to.equal(6);
  const pos5 = index.upperKey(5);
  expect(pos5!.value).to.equal(6);
  const pos6 = index.upperKey(6);
  expect(pos6!.value).to.equal(6);
  const pos7 = index.upperKey(7);
  expect(pos7!.value).to.equal(8);
  const pos8 = index.upperKey(8);
  expect(pos8!.value).to.equal(8);
  const pos9 = index.upperKey(9);
  expect(pos9!.value).to.equal(11);
  const pos10 = index.upperKey(10);
  expect(pos10!.value).to.equal(11);
  const pos11 = index.upperKey(11);
  expect(pos11!.value).to.equal(11);
  const pos12 = index.upperKey(12);
  expect(pos12!.value).to.equal(15);
  const pos13 = index.upperKey(13);
  expect(pos13!.value).to.equal(15);
  const pos14 = index.upperKey(14);
  expect(pos14!.value).to.equal(15);
  const pos15 = index.upperKey(15);
  expect(pos15!.value).to.equal(15);
  const pos16 = index.upperKey(16);
  expect(pos16).to.be.null
});

test<SortedIndex<number>>("SortedIndex.lowerKey() finds the nearest lower bound if the key is not found", index => {
  index.add(1);
  index.add(3);
  index.add(6);
  index.add(8);
  index.add(11);
  index.add(15);
  const pos1 = index.lowerKey(1);
  expect(pos1!.value).to.equal(1);
  const pos2 = index.lowerKey(2);
  expect(pos2!.value).to.equal(1);
  const pos3 = index.lowerKey(3);
  expect(pos3!.value).to.equal(3);
  const pos4 = index.lowerKey(4);
  expect(pos4!.value).to.equal(3);
  const pos5 = index.lowerKey(5);
  expect(pos5!.value).to.equal(3);
  const pos6 = index.lowerKey(6);
  expect(pos6!.value).to.equal(6);
  const pos7 = index.lowerKey(7);
  expect(pos7!.value).to.equal(6);
  const pos8 = index.lowerKey(8);
  expect(pos8!.value).to.equal(8);
  const pos9 = index.lowerKey(9);
  expect(pos9!.value).to.equal(8);
  const pos10 = index.lowerKey(10);
  expect(pos10!.value).to.equal(8);
  const pos11 = index.lowerKey(11);
  expect(pos11!.value).to.equal(11);
  const pos12 = index.lowerKey(12);
  expect(pos12!.value).to.equal(11);
  const pos13 = index.lowerKey(13);
  expect(pos13!.value).to.equal(11);
  const pos14 = index.lowerKey(14);
  expect(pos14!.value).to.equal(11);
  const pos15 = index.lowerKey(15);
  expect(pos15!.value).to.equal(15);
  const pos16 = index.lowerKey(16);
  expect(pos16!.value).to.equal(15);
});;