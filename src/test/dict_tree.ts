
import addTests from "./dict"
import TeeeDict from "../dict/tree"
import { expect } from "chai"

describe('a tree-based dictionary', () => {

  addTests(() => new TeeeDict<any>());

})


