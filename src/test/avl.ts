
import { expect } from "chai"

import { spread, spreadR } from "../iterator"

export function shuffle<T>(array: T[]) {

  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

}

const TEST_SETS_COUNT = 4;

import AVL from "../avl"

function* inorder(node) {
  if (node===null) return;
  yield* inorder(node.left);
  yield node.value;
  yield* inorder(node.right);
}

describe('an AVL-tree', () => {

  it('can insert elements', () => {
    const t1 = new AVL();
    t1.insert(1);
    t1.insert(5);
    t1.insert(2);
    t1.insert(3);
    t1.insert(4);
    expect([...t1]).to.deep.equal([1, 2, 3, 4, 5]);
  });

  for (let i = 1; i <= TEST_SETS_COUNT; ++i) {
    it(`can insert from random set ${i}`, () => {
      const els = require(`./numbers${i}.json`);   
      const t1 = new AVL();
      for (const el of els) {
        t1.insert(el);
        let last = -1;
        for (const inserted of t1) {
          expect(last).to.be.below(inserted);
        }
      }
    });
  }

  for (let i = 1; i <= TEST_SETS_COUNT; ++i) {
    it(`can insert from random set ${i}`, () => {
      const els = require(`./numbers${i}.json`);   
      const t1 = new AVL();
      for (const el of els) {
        t1.insert(el);
        let last = -1;
        for (const inserted of t1) {
          expect(last).to.be.below(inserted);
        }
      }
      els.sort((a,b) => a-b);
      const s = new Set<number>(els);
      shuffle(els);
      for (const el of els) {
        t1.remove(el);
        s.delete(el);
        expect([...t1]).to.deep.equal([...s]);
      }
    });
  }

  it('can delete elements', () => {
    const t1 = new AVL();
    t1.insert(1);
    t1.insert(5);
    t1.insert(2);
    t1.insert(3);
    t1.insert(4);
    expect([...t1]).to.deep.equal([1, 2, 3, 4, 5]);
    t1.remove(4);
    expect([...t1]).to.deep.equal([1, 2, 3, 5]);
    t1.remove(1);
    expect([...t1]).to.deep.equal([2, 3, 5]);
    t1.remove(2);
    expect([...t1]).to.deep.equal([3, 5]);
    t1.remove(3);
    expect([...t1]).to.deep.equal([5]);
    t1.remove(5);
    expect([...t1]).to.deep.equal([]);
  });

  it('can find the lower bound', () => {
    const t1 = new AVL();
    t1.insert(1);
    t1.insert(5);
    t1.insert(2);
    t1.insert(3);
    t1.insert(4);
    const it = t1.lower(2);
    expect(spread(it)).to.deep.equal([3,4,5]);
  });

  it('can find the upper bound', () => {
    const t1 = new AVL();
    t1.insert(1);
    t1.insert(5);
    t1.insert(2);
    t1.insert(3);
    t1.insert(4);
    const it1 = t1.upper(4);
    expect(spreadR(it1)).to.deep.equal([3,2,1]);
    const it2 = t1.upper(2);
    expect(spreadR(it2)).to.deep.equal([1]);
  });

  it('can reverse-iterate over elements', () => {
    const t1 = new AVL();
    t1.insert(1);
    t1.insert(5);
    t1.insert(2);
    t1.insert(3);
    t1.insert(4);
    const it = t1.end();
    const r1 = it.prev();
    expect(r1.done).to.be.false;
    expect(r1.value).to.equal(5);
    const r2 = it.prev();
    expect(r2.done).to.be.false;
    expect(r2.value).to.equal(4);
    const r3 = it.prev();
    expect(r3.done).to.be.false;
    expect(r3.value).to.equal(3);
    const r4 = it.prev();
    expect(r4.done).to.be.false;
    expect(r4.value).to.equal(2);
    const r5 = it.prev();
    expect(r5.done).to.be.false;
    expect(r5.value).to.equal(1);
  });


});

