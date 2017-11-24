
import "./helpers"
import Vector from "../vector"
import addTests from "./ordered"
import { expect } from "chai"

describe('an array-like vector', () => {
  
  addTests(() => new Vector<any>())

  it('can take slices', () => {
    const v = new Vector();
    v.append(1);
    v.append(2);
    v.append(3);
    v.append(4);
    const s1 = v.slice(1, 3);
    expect([...s1]).to.deep.equal([2,3]);
    const s2 = v.slice(0,0);
    expect([...s2]).to.deep.equal([]);
  });

  it('can take slices of slices', () => {
    const v = new Vector();
    v.append(1);
    v.append(2);
    v.append(3);
    v.append(4);
    const s1 = v.slice(1, 3).slice(1, 2);
    expect([...s1]).to.deep.equal([3]);
  });

})

