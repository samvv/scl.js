
import { expect } from "chai"

import { Queuelike } from "../interfaces"
import PriorityQueue from "../priority-queue"
import { test } from "./_helpers"

test('PriorityQueue iterates over elements in the correct order', (q: Queuelike<number>) => {
  q.add(10);
  q.add(51);
  q.add(5);
  q.add(23);
  q.add(15);
  q.add(70);
  expect([...q]).to.deep.equal([5, 10, 15, 23, 51, 70]);
})

test('PriorityQueue can iterate over elements multiple times', (q: Queuelike<number>) => {
  q.add(10);
  q.add(51);
  q.add(5);
  q.add(23);
  q.add(15);
  q.add(70);
  expect([...q]).to.deep.equal([5, 10, 15, 23, 51, 70]);
  expect([...q]).to.deep.equal([5, 10, 15, 23, 51, 70]);
})

test('PriorityQueue.pop() dequeues elements according to priority', (q: Queuelike<number>) => {
  q.add(10);
  q.add(51);
  q.add(5);
  q.add(23);
  q.add(15);
  q.add(70);
  expect(q.pop()).to.equal(5);
  expect(q.pop()).to.equal(10);
  expect(q.pop()).to.equal(15);
  expect(q.pop()).to.equal(23);
  expect(q.pop()).to.equal(51);
  expect(q.pop()).to.equal(70);
})

test('PriorityQueue.peek() find the element with the highest priority without removing it', (q: Queuelike<number>) => {
  q.add(10);
  expect(q.peek()).to.equal(10);
  q.add(51);
  expect(q.peek()).to.equal(10);
  q.add(5);
  expect(q.peek()).to.equal(5);
  q.add(23);
  expect(q.peek()).to.equal(5);
  q.add(15);
  expect(q.peek()).to.equal(5);
  q.add(70);
  expect(q.peek()).to.equal(5);
  q.pop();
  expect(q.peek()).to.equal(10);
})

