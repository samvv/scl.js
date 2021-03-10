
import { expect } from "chai";
import { test } from "./_helpers"
import { Index } from "../interfaces";

import numbers1 from "./data/numbers1.json"
import numbers2 from "./data/numbers2.json"

test<Index<number>>("Index.add() correclty reports the element added on some random numbers", tree => {
  for (const num of numbers1) {
    expect(tree.has(num)).to.be.false
    tree.add(num);
    expect(tree.has(num)).to.be.true
    // checkInvariants((tree as any).rootNode);
  }
})

test<Index<number>>("Index.delete() correctly reports the element deleted on some random numbers", tree => {
  for (const num of numbers1) {
    tree.add(num);
  }
  // checkInvariants((tree as any).rootNode);
  for (const num of numbers2) {
    expect(tree.has(num)).to.be.true
    tree.delete(num);
    expect(tree.has(num)).to.be.false
    // checkInvariants((tree as any).rootNode);
  }
});
