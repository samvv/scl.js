
import addTests from "./unordered"
import ESSet from "../set/es6"

describe('an ES6 set wrapper', () => {
  
  addTests(() => new ESSet())

})

