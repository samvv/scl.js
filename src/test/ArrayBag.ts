
import addGenericUnorderedContainerTests from "./UnorderedContainer"
import addGenericBagTests from "./Bag"

import { ArrayBag } from "../ArrayBag"

describe('array-based bag', () => {
  function createEmptyBag() { 
    return new ArrayBag()
  }
  addGenericUnorderedContainerTests(createEmptyBag)
  addGenericBagTests(createEmptyBag)
})

