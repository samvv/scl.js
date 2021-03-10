
import { expect } from "chai";
import { SortedIndex } from "../interfaces"
import { test } from "./_helpers"

test<SortedIndex<number>>("SortedMultiIndex.add() can store multiple equal keys", index => {
  index.add(1);
  index.add(5);
  index.add(2);
  index.add(3);
  index.add(3);
  index.add(3);
  index.add(4);
  expect([...index]).to.deep.equal([1, 2, 3, 3, 3, 4, 5]);
});

test<SortedIndex<number>>("SortedMultiIndex.equalKeys() returns a range with only keys that are the same", index => {
  index.add(1);
  index.add(2);
  index.add(3);
  index.add(3);
  index.add(3);
  index.add(4);
  index.add(5);
  expect([...index.equalKeys!(7)]).to.deep.equal([]);
  expect([...index.equalKeys!(3)]).to.deep.equal([3, 3, 3]);
})