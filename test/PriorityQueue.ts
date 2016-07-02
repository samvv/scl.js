
/// <reference path="../typings/index.d.ts" />

import { PriorityQueue } from "../src/PriorityQueue"
import { expect } from "chai"

function fillQueue(queue) {
  queue.enqueue(5)
  queue.enqueue(9)
  queue.enqueue(2)
  queue.enqueue(3)
  queue.enqueue(6)
  queue.enqueue(1)
  queue.enqueue(8)
  queue.enqueue(7)
  queue.enqueue(4)
}

describe('a priority queue', () => {
  it('peeks the element with highest priority', () => {
    const queue = new PriorityQueue()
    fillQueue(queue)
    expect(queue.peek()).to.equal(1)
  })

  it('returns the element with second-hightest priority', () => {
    const queue = new PriorityQueue()
    fillQueue(queue)
    expect(queue.dequeue()).to.equal(1)
    expect(queue.dequeue()).to.equal(2)
  })

  it('returns the element with second-hightest priority', () => {
    const queue = new PriorityQueue()
    fillQueue(queue)
    expect(queue.dequeue()).to.equal(1)
    expect(queue.dequeue()).to.equal(2)
    expect(queue.dequeue()).to.equal(3)
  })

  it('return all items in order of priority', () => {
    const queue = new PriorityQueue()
    fillQueue(queue)
    expect(queue.dequeue()).to.equal(1)
    expect(queue.dequeue()).to.equal(2)
    expect(queue.dequeue()).to.equal(3)
    expect(queue.dequeue()).to.equal(4)
    expect(queue.dequeue()).to.equal(5)
    expect(queue.dequeue()).to.equal(6)
    expect(queue.dequeue()).to.equal(7)
    expect(queue.dequeue()).to.equal(8)
    expect(queue.dequeue()).to.equal(9)
  })

  it('can remove an element from the queue', () => {
    const queue = new PriorityQueue()
    fillQueue(queue)
    queue.remove(4)
    expect(queue.has(4)).to.be.false
    expect(queue.dequeue()).to.equal(1)
    expect(queue.dequeue()).to.equal(2)
    expect(queue.dequeue()).to.equal(3)
    expect(queue.dequeue()).to.equal(5)
    expect(queue.dequeue()).to.equal(6)
    expect(queue.dequeue()).to.equal(7)
    expect(queue.dequeue()).to.equal(8)
    expect(queue.dequeue()).to.equal(9)
  })

  it('can remove an ì
})


