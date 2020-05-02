
import { expect } from "chai";

import { equal, lesser } from "../util";

describe("default lesser", () => {

  it("can compare strings", () => {
    expect(lesser("foo", "bar")).to.be.false;
    expect(lesser("bar", "foo")).to.be.true;
    expect(lesser("foo", "foo")).to.be.false;
  });

  it("can compare numbers", () => {
    expect(lesser(5, 3)).to.be.false;
    expect(lesser(3, 5)).to.be.true;
    expect(lesser(5, 5)).to.be.false;
  });

  it("can compare objects", () => {
    expect(lesser({ foo: 1 }, { foo: 1 })).to.be.false;
    expect(lesser({ foo: 1 }, { foo: 1, bar: true })).to.be.true;
    expect(lesser({ foo: 1, bar: true }, { foo: 1 })).to.be.false;
  });

  it("can compare arrays", () => {
    expect(lesser([1, 2], [1, 2])).to.be.false;
    expect(lesser([1, 2], [1, 2, 3])).to.be.true;
    expect(lesser([5, 6], [1, 2, 3])).to.be.true;
    expect(lesser([1, 2, 3], [5, 6])).to.be.false;
  });

  it("can equate values that should be equal", () => {
    expect(equal({ foo: 1 }, { foo: 1 })).to.be.true;
    expect(equal({ foo: 1 }, { foo: 2 })).to.be.false;
    expect(equal({ foo: 1 }, { foo: 1, bar: 1 })).to.be.false;
  });

});
