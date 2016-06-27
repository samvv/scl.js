


import { DoubleLinkedList } from "../src/DoubleLinkedList"
import addCTests from "./Container"
import addOCTests from "./OrderedContainer"

describe('double linked list', () => {
  addCTests(() => new DoubleLinkedList<any>())
  addOCTests(() => new DoubleLinkedList<any>())
})

