
import { expect } from "chai";
import { test } from "./_helpers"

import AVLTreeIndex from "../AVLTreeIndex";

test<AVLTreeIndex<number>>("AVLTreeIndex.add() successfully adds new elements", avl => {
  avl.add(1);
  avl.add(5);
  avl.add(2);
  avl.add(3);
  avl.add(4);
  expect([...avl]).to.deep.equal([1, 2, 3, 4, 5]);
});

test<AVLTreeIndex<number>>("AVLTreeIndex.add() can store multiple equal keys", avl => {
  avl.add(1);
  avl.add(5);
  avl.add(2);
  avl.add(3);
  avl.add(3);
  avl.add(3);
  avl.add(4);
  expect([...avl]).to.deep.equal([1, 2, 3, 3, 3, 4, 5]);
});

test<AVLTreeIndex<number>>("AVLTreeIndex.delete() successfully deletes elements", avl => {
  avl.add(1);
  avl.add(5);
  avl.add(2);
  avl.add(3);
  avl.add(4);
  expect([...avl]).to.deep.equal([1, 2, 3, 4, 5]);
  avl.delete(4);
  expect([...avl]).to.deep.equal([1, 2, 3, 5]);
  avl.delete(1);
  expect([...avl]).to.deep.equal([2, 3, 5]);
  avl.delete(2);
  expect([...avl]).to.deep.equal([3, 5]);
  avl.delete(3);
  expect([...avl]).to.deep.equal([5]);
  avl.delete(5);
  expect([...avl]).to.deep.equal([]);
});

test<AVLTreeIndex<number>>("AVLTreeIndex.lowerKey() finds nearest smaller key", avl => {
  avl.add(1);
  avl.add(5);
  avl.add(2);
  avl.add(3);
  avl.add(4);
  const pos = avl.lowerKey(2);
  expect(pos).to.be.ok;
  expect(pos!.value).to.equal(3);
});

test<AVLTreeIndex<number>>("AVLTreeIndex.upperKey() finds the nearest larger key", avl => {
  avl.add(1);
  avl.add(5);
  avl.add(2);
  avl.add(3);
  avl.add(4);
  const pos1 = avl.upperKey(4);
  expect(pos1).to.be.ok;
  expect(pos1!.value).to.equal(3);
  const pos2 = avl.upperKey(2);
  expect(pos2).to.be.ok;
  expect(pos2!.value).to.equal(1);
});

test<AVLTreeIndex<number>>("AVLTreeIndex.toRange() can reverse-iterate over elements", avl => {
  avl.add(1);
  avl.add(5);
  avl.add(2);
  avl.add(3);
  avl.add(4);
  expect([...avl.toRange().reverse()]).to.deep.equal([5, 4, 3, 2, 1]);
});

test<AVLTreeIndex<number>>("AVLTreeIndex.equalKeys() returns a range with only keys that are the same", avl => {
  avl.add(1);
  avl.add(2);
  avl.add(3);
  avl.add(3);
  avl.add(3);
  avl.add(4);
  avl.add(5);
  expect([...avl.equalKeys(7)]).to.deep.equal([]);
  expect([...avl.equalKeys(3)]).to.deep.equal([3, 3, 3]);
})

