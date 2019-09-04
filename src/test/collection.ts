
import { Collection } from "../interfaces"
import { expect } from "chai"
import { test } from "./_helpers"

test('Collection.add() returns a cursor to the added element', (coll: Collection<number>) => {
  const [added1, pos1] = coll.add(1);
  expect(added1).to.be.true;
  expect(pos1.value).to.equal(1);
});

test('Collection.size is correctly updated when adding elements', (coll: Collection<string>) => {
  expect(coll.size).to.equal(0);
  coll.add('a');
  expect(coll.size).to.equal(1);
  coll.add('b');
  expect(coll.size).to.equal(2);
  coll.add('c');
  expect(coll.size).to.equal(3);
})

test('Collection.size is correctly updated when deleting elements', (coll: Collection<string>) => {
  coll.add('a');
  coll.add('b');
  coll.add('c');
  expect(coll.size).to.equal(3);
  coll.delete('b');
  expect(coll.size).to.equal(2);
  coll.delete('c');
  expect(coll.size).to.equal(1);
  coll.delete('a');
  expect(coll.size).to.equal(0);
})

test('Collection.toRange() generates the elements of the full colluence', (coll: Collection<string>) => {
  coll.add('a');
  coll.add('b');
  coll.add('c');
  coll.add('d');
  const elements = [...coll.toRange()];
  expect(elements).to.have.lengthOf(4);
  expect(elements).to.include('a');
  expect(elements).to.include('b');
  expect(elements).to.include('c');
  expect(elements).to.include('d');
});

test('Collection.toRange().size returns the correct size', (coll: Collection<string>) => {
  expect(coll.toRange().size).to.equal(0);
  coll.add('a');
  expect(coll.toRange().size).to.equal(1);
  coll.add('b');
  expect(coll.toRange().size).to.equal(2);
  coll.add('c');
  expect(coll.toRange().size).to.equal(3);
});

