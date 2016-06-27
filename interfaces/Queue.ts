
import { Container } from "./Container"

export interface Queue<T> extends Container<T> {
  push(el: T)
  peek(el: T)
  pop(el: T)
}

