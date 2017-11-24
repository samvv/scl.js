
import "./helpers";
import addTests from "./ordered"
import DLList from "../list/double"

describe('a double-linked list', () => {

  addTests(() => new DLList<any>())

})

