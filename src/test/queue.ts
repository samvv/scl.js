
import Queue from "../queue"
import { test } from "./_helpers"
import { expect } from "chai"

test('Queue.peek() always peeks the front of the queue', (queue: Queue<number>) => {
  queue.add(1);
  expect(queue.peek()).to.equal(1);
  queue.add(2);
  expect(queue.peek()).to.equal(1);
  queue.add(3);
  expect(queue.peek()).to.equal(1);
});

test('Queue.pop() pops the front of the queue', (queue: Queue<number>) => {
  queue.add(1);
  queue.add(2);
  queue.add(3);
  expect(queue.pop()).to.equal(1);
  expect(queue.pop()).to.equal(2);
  expect(queue.pop()).to.equal(3);
});

test('Queue.pop() throws an error if there is no element in the queue', (queue: Queue<number>) => {
  expect(() => queue.pop()).to.throw(Error);
});

