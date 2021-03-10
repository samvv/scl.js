
import { expect } from "chai";

import { isEqual, lessThan } from "../util";

function equalByLesser(a: any, b: any): boolean {
  return !lessThan(a, b) && !lessThan(b, a);
}

describe("default lesser", () => {

  it("can compare strings", () => {
    expect(lessThan("foo", "bar")).to.be.false;
    expect(lessThan("bar", "foo")).to.be.true;
    expect(lessThan("foo", "foo")).to.be.false;
  });

  it("can compare numbers", () => {
    expect(lessThan(5, 3)).to.be.false;
    expect(lessThan(3, 5)).to.be.true;
    expect(lessThan(5, 5)).to.be.false;
  });

  it("can compare objects", () => {
    expect(lessThan({ foo: 1 }, { foo: 1 })).to.be.false;
    expect(lessThan({ foo: 0 }, { foo: 1 })).to.be.true;
    expect(lessThan({ foo: 1, bar: true }, { foo: 1 })).to.be.false;
  });

  it("can compare arrays", () => {
    expect(lessThan([1, 2], [1, 2])).to.be.false;
    expect(lessThan([1, 2], [1, 2, 3])).to.be.true;
    expect(lessThan([5, 6], [1, 2, 3])).to.be.false;
    expect(lessThan([1, 2, 3], [5, 6])).to.be.false;
  });

  it("holds the invariant that two values are equal if they're not lesser", () => {

    expect(equalByLesser('foo', 'foo')).to.be.true
    expect(equalByLesser('foobar', 'foobar')).to.be.true
    expect(equalByLesser('foo', 'foobar')).to.be.false
    expect(equalByLesser('foobar', 'foo')).to.be.false
    expect(equalByLesser('foo', 'bar')).to.be.false
    expect(equalByLesser('bar', 'foo')).to.be.false

    expect(equalByLesser(1, 1)).to.be.true
    expect(equalByLesser(1, 2)).to.be.false
    expect(equalByLesser(2, 1)).to.be.false

    expect(equalByLesser([1, 2], [1, 2])).to.be.true;
    expect(equalByLesser([1, 2], [1, 2, 3])).to.be.false;
    expect(equalByLesser([1, 2, 3], [1, 2])).to.be.false;
    expect(equalByLesser([0, 1], [1, 2])).to.be.false;
    expect(equalByLesser([1, 2], [0, 1])).to.be.false;
    expect(equalByLesser([5, 2, 3], [5, 2, 3])).to.be.true

    expect(equalByLesser({ foo: 1 }, { foo: 1 })).to.be.true
    expect(equalByLesser({ foo: 1, bar: 2 }, { foo: 1, bar: 2 })).to.be.true
    expect(equalByLesser({ foo: 1, bar: 2 }, { foo: 1 })).to.be.false
    expect(equalByLesser({ foo: 1 }, { foo: 1, bar: 2 })).to.be.false
    expect(equalByLesser({ foo: 0 }, { foo: 1 })).to.be.false
    expect(equalByLesser({ foo: 1 }, { foo: 0 })).to.be.false

  });

});

describe('an equality function', () => {

  it("can equate values that should be equal", () => {
    expect(isEqual({ foo: 1 }, { foo: 1 })).to.be.true;
    expect(isEqual({ foo: 1 }, { foo: 2 })).to.be.false;
    expect(isEqual({ foo: 1 }, { foo: 1, bar: 1 })).to.be.false;
  });

});
