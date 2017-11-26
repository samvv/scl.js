
import { addSingleTests, addManyTests, addMultiTests } from "./dict"
import TeeeDict from "../dict/tree"
import TeeeManyDict from "../dict/many/tree"
import TeeeMultiDict from "../dict/multi/tree"

import { expect } from "chai"

describe('a tree-based dictionary', () => {

  addSingleTests(() => new TeeeDict<any>());

})

describe('a tree-based multi-key dictionary', () => {

  addManyTests(() => new TeeeManyDict<any>());

})

describe('a tree-based multi-pair dictionary', () => {

  addMultiTests(() => new TeeeMultiDict<any>());

})


