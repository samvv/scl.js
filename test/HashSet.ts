
/// <reference path="../typings/index.d.ts" />

require('source-map-support').install()

import { HashSet } from "../src/HashSet"

import addCTests from "./Container"
import addUCTests from "./UnorderedContainer"

describe('hashing-based set', () => {
  function createEmptySet() {
    return new HashSet<any>()
  }
  addCTests(createEmptySet)
  addUCTests(createEmptySet)
})

