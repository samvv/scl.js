
import { Iterator } from "../interfaces/Iterator"

export abstract class AbstractIterator<T> implements Iterator<T> {

  abstract next(): { done: boolean, value?: T }

}

