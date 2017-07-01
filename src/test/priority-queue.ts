
import "./helpers"
import { expect } from "chai"

import PriorityQueue from "../priority-queue"

describe('a prioriry queue', () => {
  
  it('returns elements in the correct order', () => {
    const q = new PriorityQueue<number>((a,b) => a < b)
    q.add(10)
    q.add(51)
    q.add(5)
    q.add(23)
    q.add(15)
    q.add(70)
    expect([...q]).to.deep.equal([5, 10, 15, 23, 51, 70])
  })

  it('can iterate over elements multiple times', () => {
    const q = new PriorityQueue<number>((a,b) => a < b)
    q.add(10)
    q.add(51)
    q.add(5)
    q.add(23)
    q.add(15)
    q.add(70)
    expect([...q]).to.deep.equal([5, 10, 15, 23, 51, 70])
    expect([...q]).to.deep.equal([5, 10, 15, 23, 51, 70])
  })

  it('dequeues elements according to priority', () => {
    const q = new PriorityQueue<number>((a,b) => a < b)
    q.add(10)
    q.add(51)
    q.add(5)
    q.add(23)
    q.add(15)
    q.add(70)
    expect(q.dequeue()).to.equal(5)
    expect(q.dequeue()).to.equal(10)
    expect(q.dequeue()).to.equal(15)
    expect(q.dequeue()).to.equal(23)
    expect(q.dequeue()).to.equal(51)
    expect(q.dequeue()).to.equal(70)
  })

})

