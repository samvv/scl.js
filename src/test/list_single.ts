
import "./helpers";
import addTests from "./sequence"
import SLList from "../list/single"

describe('a single-linked list', () => {

  addTests(() => new SLList<any>())

})

