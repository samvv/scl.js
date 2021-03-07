
import { expect } from "chai";
import Stack from "../Stack";
import { test } from "./_helpers";

test("Stack.peek() always peeks the top of the stack", (stack: Stack<number>) => {
  stack.add(1);
  expect(stack.peek()).to.equal(1);
  stack.add(2);
  expect(stack.peek()).to.equal(2);
  stack.add(3);
  expect(stack.peek()).to.equal(3);
});

test("Stack.pop() pops the top of the stack", (stack: Stack<number>) => {
  stack.add(1);
  stack.add(2);
  stack.add(3);
  expect(stack.pop()).to.equal(3);
  expect(stack.pop()).to.equal(2);
  expect(stack.pop()).to.equal(1);
});

test("Stack.pop() throws an error if there is no element on the stack", (stack: Stack<number>) => {
  expect(() => stack.pop()).to.throw(Error);
});
