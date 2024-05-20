
import { expect } from "chai";
import { Dict } from "../interfaces.js";
import { test } from "./_helpers.js";

test<Dict<number, number>>("Dict.emplace() throws an error by default when keys are the same", dict => {
  dict.emplace(1, 2);
  expect(() => { dict.emplace(1, 1) }).to.throw(Error);
  expect(() => { dict.emplace(1, 3) }).to.throw(Error);
  expect(() => { dict.emplace(1, 4) }).to.throw(Error);
});

test<Dict<number, number>>("Dict.add() throws an error by default when keys are the same", dict => {
  dict.add([1, 2]);
  expect(() => { dict.add([1, 1]) }).to.throw(Error);
  expect(() => { dict.add([1, 3]) }).to.throw(Error);
  expect(() => { dict.add([1, 4]) }).to.throw(Error);
});

test<Dict<number, number>>("Dict.getValue() returns the correct value for a given element", dict => {
  dict.add([1, 2]);
  dict.add([3, 4]);
  expect(dict.getValue(1)).to.equal(2);
  expect(dict.getValue(3)).to.equal(4);
});

test<Dict<number, number>>("Dict.getValue() returns undefined if avalue is not there", dict => {
  dict.add([1, 2]);
  dict.add([3, 4]);
  expect(dict.getValue(5)).to.be.undefined;
  expect(dict.getValue(2)).to.be.undefined;
  expect(dict.getValue(4)).to.be.undefined;
});

