
import { expect } from "chai";
import Vector from "../Vector";
import { test } from "./_helpers";

test("Vector.slice() can take slices", (v: Vector<number>) => {
  v.append(1);
  v.append(2);
  v.append(3);
  v.append(4);
  const s1 = v.slice(1, 3);
  expect([...s1]).to.deep.equal([2, 3]);
  const s2 = v.slice(0, 0);
  expect([...s2]).to.deep.equal([]);
});

test("Vector.slice() can take slices of slices", (v: Vector<number>) => {
  v.append(1);
  v.append(2);
  v.append(3);
  v.append(4);
  const s1 = v.slice(1, 3).slice(1, 2);
  expect([...s1]).to.deep.equal([3]);
});

test("Vector.insertBefore() allocates more storage if required", (v: Vector<number>) => {
  expect(v.capacity).to.equal(5);
  const cursor = v.append(1);
  v.insertBefore(cursor, 2);
  v.insertBefore(cursor, 3);
  v.insertBefore(cursor, 4);
  v.insertBefore(cursor, 5);
  expect(v.capacity).to.equal(5);
  v.insertBefore(cursor, 6);
  expect(v.capacity).to.equal(10);
  v.insertBefore(cursor, 7);
  v.insertBefore(cursor, 8);
  v.insertBefore(cursor, 9);
  v.insertBefore(cursor, 10);
  expect(v.capacity).to.equal(10);
  v.insertBefore(cursor, 11);
  expect(v.capacity).to.equal(15);
}, {
  args: [{ allocStep: 5, capacity: 5 }],
});

test("Vector.insertAfter() allocates more storage if required", (v: Vector<number>) => {
  expect(v.capacity).to.equal(5);
  const cursor = v.append(1);
  v.insertAfter(cursor, 2);
  v.insertAfter(cursor, 3);
  v.insertAfter(cursor, 4);
  v.insertAfter(cursor, 5);
  expect(v.capacity).to.equal(5);
  v.insertAfter(cursor, 6);
  expect(v.capacity).to.equal(10);
  v.insertAfter(cursor, 7);
  v.insertAfter(cursor, 8);
  v.insertAfter(cursor, 9);
  v.insertAfter(cursor, 10);
  expect(v.capacity).to.equal(10);
  v.insertAfter(cursor, 11);
  expect(v.capacity).to.equal(15);
}, {
  args: [{ allocStep: 5, capacity: 5 }],
});

test("Vector.append() allocates more storage if required", (v: Vector<number>) => {
  expect(v.capacity).to.equal(5);
  v.append(1);
  v.append(2);
  v.append(3);
  v.append(4);
  v.append(5);
  expect(v.capacity).to.equal(5);
  v.append(6);
  expect(v.capacity).to.equal(10);
  v.append(7);
  v.append(8);
  v.append(9);
  v.append(10);
  expect(v.capacity).to.equal(10);
  v.append(11);
  expect(v.capacity).to.equal(15);
}, {
  args: [{ allocStep: 5, capacity: 5 }],
});

test("Vector.prepend() allocates more storage if required", (v: Vector<number>) => {
  expect(v.capacity).to.equal(3);
  v.prepend(1);
  v.prepend(2);
  v.prepend(3);
  expect(v.capacity).to.equal(3);
  v.prepend(4);
  expect(v.capacity).to.equal(8);
  v.prepend(5);
  v.prepend(6);
  v.prepend(7);
  v.prepend(8);
  expect(v.capacity).to.equal(8);
  v.prepend(9);
  expect(v.capacity).to.equal(13);
  v.prepend(10);
  v.prepend(11);
  expect(v.capacity).to.equal(13);
}, {
  args: [{ allocStep: 5, capacity: 3 }],
});

test("Vector.replace() throws a RangeError if the index is out of bounds", (v: Vector<number>) => {
  expect(() => v.replace(0, 5)).to.throw(RangeError);
  v.append(1);
  v.append(2);
  v.append(3);
  expect(() => v.replace(10, 5)).to.throw(RangeError);
});

test("Vector.shrinkFit() shrinks the vector to fit its size", (v: Vector<number>) => {
  v.append(1);
  v.append(2);
  v.append(3);
  v.shrinkFit();
  expect(v.capacity).to.equal(3);
});

test("Vector.shrinkFit() retains the elements that are added to the vector", (v: Vector<number>) => {
  v.append(1);
  v.append(2);
  v.append(3);
  v.shrinkFit();
  expect(v.size).to.equal(3);
  expect(v.getAt(0)).to.equal(1);
  expect(v.getAt(1)).to.equal(2);
  expect(v.getAt(2)).to.equal(3);
});

test("Vector.allocate() grows the vector if it is too small", (v: Vector<number>) => {
  expect(v.capacity).to.equal(3);
  v.allocate(15);
  expect(v.capacity).to.equal(15);
}, { args: [{ allocStep: 5, capacity: 3 } ] });
