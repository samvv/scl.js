
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

  it('can store multiple equal keys', () => {
    const t1 = new AVL();
    t1.insert(1);
    t1.insert(5);
    t1.insert(2);
    t1.insert(3);
    t1.insert(3);
    t1.insert(3);
    t1.insert(4);
    expect([...t1]).to.deep.equal([1,2,3,3,3,4,5]);
  })


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
    const pos = t1.lower(2);
    expect(pos.value).to.equal(3);
  });

  it('can find the upper bound', () => {
    const t1 = new AVL();
    t1.insert(1);
    t1.insert(5);
    t1.insert(2);
    t1.insert(3);
    t1.insert(4);
    const pos1 = t1.upper(4);
    expect(pos1.value).to.equal(3);
    const pos2 = t1.upper(2);
    expect(pos2.value).to.equal(1);
  });

  it('can reverse-iterate over elements', () => {
    const t1 = new AVL();
    t1.insert(1);
    t1.insert(5);
    t1.insert(2);
    t1.insert(3);
    t1.insert(4);
    const pos = t1.end();
    expect([...pos.reverse()]).to.deep.equal([5,4,3,2,1]);
  });

  it('can traverse an equal range', () => {
    const t1 = new AVL();
    t1.insert(1);
    t1.insert(2);
    t1.insert(3);
    t1.insert(3);
    t1.insert(3);
    t1.insert(4);
    t1.insert(5);
    expect([...t1.equal(7)]).to.deep.equal([]);
    expect([...t1.equal(3)]).to.deep.equal([3,3,3]);
  });


});

