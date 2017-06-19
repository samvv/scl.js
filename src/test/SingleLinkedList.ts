
import { SingleLinkedList } from "../SingleLinkedList"
import addCTests from "./Container"
import addOCTests from "./OrderedContainer"

describe('singly linked list', () => {
  addCTests(() => new SingleLinkedList<any>())
  addOCTests(() => new SingleLinkedList<any>())
})

