
import { expect } from "chai";
import { Collection } from "../interfaces.js";
import { checkInvariants } from "./invariants.js";
import { test } from "./_helpers.js";

import numbers1 from "./data/numbers1.json" with { "type": "json" };
import numbers2 from "./data/numbers2.json" with { "type": "json" };

test("Collection.add() returns a cursor to the added element", (coll: Collection<number>) => {
  const [added1, pos1] = coll.add(1);
  expect(added1).to.be.true;
  expect(pos1.value).to.equal(1);
  const [added2, pos2] = coll.add(2);
  expect(added2).to.be.true;
  expect(pos2.value).to.equal(2);
  const [added3, pos3] = coll.add(3);
  expect(added3).to.be.true;
  expect(pos3.value).to.equal(3);
  const [added4, pos4] = coll.add(4);
  expect(added4).to.be.true;
  expect(pos4.value).to.equal(4);
});

test("Collection.add() successfully adds new elements and reports them as added", (coll: Collection<number>) => {
  expect(coll.has(1)).to.be.false
  expect(coll.has(2)).to.be.false
  expect(coll.has(3)).to.be.false
  expect(coll.has(4)).to.be.false
  expect(coll.has(5)).to.be.false
  checkInvariants(coll);
  coll.add(1);
  expect(coll.has(2)).to.be.false
  expect(coll.has(3)).to.be.false
  expect(coll.has(4)).to.be.false
  expect(coll.has(5)).to.be.false
  checkInvariants(coll);
  coll.add(5);
  expect(coll.has(3)).to.be.false
  expect(coll.has(4)).to.be.false
  expect(coll.has(2)).to.be.false
  checkInvariants(coll);
  coll.add(2);
  expect(coll.has(4)).to.be.false
  expect(coll.has(3)).to.be.false
  checkInvariants(coll);
  coll.add(3);
  expect(coll.has(4)).to.be.false
  checkInvariants(coll);
  coll.add(4);
  checkInvariants(coll);
  expect(coll.has(1)).to.be.true
  expect(coll.has(2)).to.be.true
  expect(coll.has(3)).to.be.true
  expect(coll.has(4)).to.be.true
  expect(coll.has(5)).to.be.true
});

test("Collection.add() should work some random data", (collection: Collection<number>) => {
  checkInvariants(collection);
  for (const num of numbers1) {
    collection.add(num);
    checkInvariants(collection);
  }
})

test("RBTreeIndex.delete() works on some examples", (collection: Collection<number>) => {
  collection.add(1);
  collection.add(3);
  collection.add(4);
  collection.add(2);
  collection.add(5);
  checkInvariants(collection);
  collection.delete(2);
  checkInvariants(collection);
  collection.delete(4);
  checkInvariants(collection);
  collection.delete(1);
  checkInvariants(collection);
  collection.delete(3);
  checkInvariants(collection);
})


test("Collection.delete() should work on some random data", (collection: Collection<number>) => {
  for (const num of numbers1) {
    collection.add(num);
  }
  checkInvariants(collection);
  for (const num of numbers2) {
    collection.delete(num);
    checkInvariants(collection);
  }
});

test("Collection.size is correctly updated when adding elements", (coll: Collection<string>) => {
  expect(coll.size).to.equal(0);
  coll.add("a");
  expect(coll.size).to.equal(1);
  coll.add("b");
  expect(coll.size).to.equal(2);
  coll.add("c");
  expect(coll.size).to.equal(3);
});

test("Collection.size is correctly updated when deleting elements", (coll: Collection<string>) => {
  coll.add("a");
  coll.add("b");
  coll.add("c");
  expect(coll.size).to.equal(3);
  coll.delete("b");
  expect(coll.size).to.equal(2);
  coll.delete("c");
  expect(coll.size).to.equal(1);
  coll.delete("a");
  expect(coll.size).to.equal(0);
});

test("Collection.toRange() generates the elements of the full sequence", (coll: Collection<string>) => {
  coll.add("a");
  coll.add("b");
  coll.add("c");
  coll.add("d");
  const elements = [...coll.toRange()];
  expect(elements).to.have.lengthOf(4);
  expect(elements).to.include("a");
  expect(elements).to.include("b");
  expect(elements).to.include("c");
  expect(elements).to.include("d");
});

test('Collection.clone() creates a collection which has the same elements as the original one', (collection: Collection<number>) => {
  collection.add(1);
  collection.add(2);
  collection.add(4);
  collection.add(7);
  collection.add(10);
  const cloned = collection.clone();
  expect(cloned.size).to.equal(5);
  expect(cloned.has(0)).to.be.false
  expect(cloned.has(1)).to.be.true
  expect(cloned.has(2)).to.be.true
  expect(cloned.has(3)).to.be.false
  expect(cloned.has(4)).to.be.true
  expect(cloned.has(5)).to.be.false
  expect(cloned.has(6)).to.be.false
  expect(cloned.has(7)).to.be.true
  expect(cloned.has(8)).to.be.false
  expect(cloned.has(9)).to.be.false
  expect(cloned.has(10)).to.be.true
  expect(cloned.has(11)).to.be.false
});

test('Collection.clone() creates a copy that is not dependant on the first collection', (collection: Collection<number>) => {

  collection.add(1);
  collection.add(2);
  collection.add(4);
  collection.add(7);
  collection.add(10);

  const cloned = collection.clone();
  cloned.add(8);
  cloned.delete(7);

  expect(collection.size).to.equal(5);
  expect(collection.has(0)).to.be.false
  expect(collection.has(1)).to.be.true
  expect(collection.has(2)).to.be.true
  expect(collection.has(3)).to.be.false
  expect(collection.has(4)).to.be.true
  expect(collection.has(5)).to.be.false
  expect(collection.has(6)).to.be.false
  expect(collection.has(7)).to.be.true
  expect(collection.has(8)).to.be.false
  expect(collection.has(9)).to.be.false
  expect(collection.has(10)).to.be.true
  expect(collection.has(11)).to.be.false

  expect(cloned.size).to.equal(5);
  expect(cloned.has(0)).to.be.false
  expect(cloned.has(1)).to.be.true
  expect(cloned.has(2)).to.be.true
  expect(cloned.has(3)).to.be.false
  expect(cloned.has(4)).to.be.true
  expect(cloned.has(5)).to.be.false
  expect(cloned.has(6)).to.be.false
  expect(cloned.has(7)).to.be.false
  expect(cloned.has(8)).to.be.true
  expect(cloned.has(9)).to.be.false
  expect(cloned.has(10)).to.be.true
  expect(cloned.has(11)).to.be.false
});


test("Collection.toRange().size returns the correct size", (coll: Collection<string>) => {
  expect(coll.toRange().size).to.equal(0);
  coll.add("a");
  expect(coll.toRange().size).to.equal(1);
  coll.add("b");
  expect(coll.toRange().size).to.equal(2);
  coll.add("c");
  expect(coll.toRange().size).to.equal(3);
});
