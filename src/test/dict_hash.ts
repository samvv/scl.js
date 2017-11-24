
import addTests, { addSingleTests, addManyTests, addMultiTests } from "./dict"
import HashDict from "../dict/hash"
import HashManyDict from "../dict/many/hash"
import HashMultiDict from "../dict/multi/hash"
import { expect } from "chai"

describe('a hash-based dictionary', () => {

  addTests(() => new HashDict<any>());
  addSingleTests(() => new HashDict<any>());

});

describe('a hash-based multi-key dictionary', () => {

  addTests(() => new HashManyDict<any>());
  addManyTests(() => new HashManyDict<any>());

});

describe('a hash-based multi-value dictionary', () => {

  addTests(() => new HashMultiDict<any>());
  addMultiTests(() => new HashMultiDict<any>());

});


