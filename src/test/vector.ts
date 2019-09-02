
import Vector from "../vector"
import { expect } from "chai"
import { test } from "./_helpers"

test('Vector.slice() can take slices', (v: Vector<number>) => {
  v.append(1);
  v.append(2);
  v.append(3);
  v.append(4);
  const s1 = v.slice(1, 3);
  expect([...s1.values()]).to.deep.equal([2,3]);
  const s2 = v.slice(0,0);
  expect([...s2.values()]).to.deep.equal([]);
});

test('Vector.slice() can take slices of slices', (v: Vector<number>) => {
  v.append(1);
  v.append(2);
  v.append(3);
  v.append(4);
  const s1 = v.slice(1, 3).slice(1, 2);
  expect([...s1.values()]).to.deep.equal([3]);
});

