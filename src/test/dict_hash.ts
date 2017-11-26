
import { addSingleTests, addManyTests, addMultiTests } from "./dict"
import HashDict from "../dict/hash"
import HashManyDict from "../dict/many/hash"
import HashMultiDict from "../dict/multi/hash"
import { expect } from "chai"

describe('a hash-based dictionary', () => {

  addSingleTests(() => new HashDict<any>());

});

describe('a hash-based multi-key dictionary', () => {


});

describe('a hash-based multi-pair dictionary', () => {

  addMultiTests(() => new HashMultiDict<any>());

});


