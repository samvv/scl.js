
import "./helpers";
import addTests, { addCursorTests } from "./sequence"
import DLList from "../list/double"

describe('a double-linked list', () => {

  addTests(() => new DLList<any>())
  addCursorTests(() => new DLList<any>())

})

