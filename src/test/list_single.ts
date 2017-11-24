
import "./helpers";
import addTests from "./ordered"
import SLList from "../list/single"

describe('a single-linked list', () => {

  addTests(() => new SLList<any>())

})

