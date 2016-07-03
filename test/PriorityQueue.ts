
/// <reference path="../typings/index.d.ts" />

require('source-map-support').install()

import { PriorityQueue } from "../src/PriorityQueue"
import { expect } from "chai"

function integers(n) {
  const arr = new Array(n)
  for (let i = 0; i < arr.length; ++i)
    arr[i] = i+1
  return arr
}

function scramble(arr) {
  for (let i = 0; i < arr.length; ++i) {
    const idx1 = Math.round(Math.random() * (arr.length-1))
        , idx2 = Math.round(Math.random() * (arr.length-1))
    const keep = arr[idx1]
    arr[idx1] = arr[idx2]
    arr[idx2] = arr[idx1]
  }
}

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

  it('returns all items in order of priority', () => {
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

  it('correctly prioritizes elements of a random array', () => {
    const elements = integers(9)
    scramble(elements)
    const queue = new PriorityQueue()
    for (const el of elements)
      queue.enqueue(el)
    const sorted = elements.sort()
    for (let i = 0; i < elements.length; ++i) {
      console.log(`seeking ${i}`)
      expect(queue.dequeue()).to.equal(sorted[i])
    }
    expect(queue.isEmpty()).to.be.true
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
    queue.remove(7)
    expect(queue.has(7)).to.be.false
    expect(queue.dequeue()).to.equal(6)
    expect(queue.dequeue()).to.equal(8)
    expect(queue.dequeue()).to.equal(9)
    expect(queue.isEmpty()).to.be.true
  })

  it('can use a custom comparator function', () => {
    type Weighted = { weight: number }
    const queue = new PriorityQueue({
      compare: (a: Weighted, b: Weighted) => a.weight < b.weight
    })
    queue.enqueue({ weight: 5 })
    queue.enqueue({ weight: 1 })
    queue.enqueue({ weight: 4 })
    //console.log(queue.dequeue(), queue.dequeue(), queue.dequeue())
    expect(queue.dequeue()).to.deep.equal({ weight: 1 })
    expect(queue.dequeue()).to.deep.equal({ weight: 4 })
    expect(queue.dequeue()).to.deep.equal({ weight: 5 })
  })

  it('can reschedule an element', () => {
    const queue = new PriorityQueue({
      compare: (a, b) => a.weight < b.weight
    })
    queue.enqueue({ weight: 5 })
    queue.enqueue({ weight: 1 })
    queue.enqueue({ weight: 3 })
    const el4 = { weight: 4 }
    queue.enqueue(el4)
    queue.enqueue({ weight: 7 })
    queue.enqueue({ weigtht: 2 })
    el4.weight = 9
    queue.reschedule(el4)
    expect(queue.dequeue()).to.deep.equal({ weight: 1 })
    expect(queue.dequeue()).to.deep.equal({ weight: 2 })
    expect(queue.dequeue()).to.deep.equal({ weight: 3 })
    expect(queue.dequeue()).to.deep.equal({ weight: 5 })
    expect(queue.dequeue()).to.deep.equal({ weight: 7 })
    expect(queue.dequeue()).to.deep.equal({ weight: 9 })
  })

})


