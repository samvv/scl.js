import { test } from "mocha";
import { expect } from "chai";
import { QuadTree, Rect } from "../QuadTree.js";

function randomQuadTree() {
  const q = new QuadTree<number>({
    shape: Rect.fromPositionAndSize(0, 0, 100, 100),
  });
  q.insert([10, 10], 1);
  q.insert([20, 10], 2);
  q.insert([23, 22], 3);
  q.insert([23, 94], 4);
  q.insert([53, 58], 5);
  q.insert([18, 22], 6);
  q.insert([76, 47], 7);
  return q;
}

test("QuadTree.find() finds a single point", () => {
  const q1 = new QuadTree<number>({
    shape: Rect.fromPositionAndSize(0, 0, 100, 100),
  });
  q1.insert([ 10, 51 ], 1);
  const l1 = q1.findKey([ 10, 51 ]);
  expect(l1!.point).to.deep.equal([10, 51]);
  expect(l1!.data).to.equal(1);
});

test("QuadTree.hasKey() doesnt report nonexistent points to exist", () => {
  const q1 = randomQuadTree();
  expect(q1.hasKey([20, 20])).to.be.false
  expect(q1.hasKey([22, 20])).to.be.false
  expect(q1.hasKey([21, 20])).to.be.false
  expect(q1.hasKey([0, 0])).to.be.false
  expect(q1.hasKey([100, 100])).to.be.false
  expect(q1.hasKey([-100, -100])).to.be.false
  expect(q1.hasKey([-100, 100])).to.be.false
  expect(q1.hasKey([100, -100])).to.be.false
});

test("QuadTree.find() reports existing points to be there", () => {
  const q1 = randomQuadTree();
  expect(q1.hasKey([10, 10])).to.be.true
  expect(q1.hasKey([20, 10])).to.be.true
  expect(q1.hasKey([23, 22])).to.be.true
  expect(q1.hasKey([23, 94])).to.be.true
  expect(q1.hasKey([53, 58])).to.be.true
  expect(q1.hasKey([18, 22])).to.be.true
  expect(q1.hasKey([76, 47])).to.be.true
});
