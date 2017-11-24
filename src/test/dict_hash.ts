
import addTests from "./dict"
import HashDict from "../dict/hash"
import { expect } from "chai"

describe('a hash-based dictionary', () => {

  addTests(() => new HashDict<any>());

})


