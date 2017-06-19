
import { Iterator } from "../interfaces"

export function getPosAt<T>(it: Iterator<T>, count: number) {
  while (true) {
    const pos = it.next()
    if ((pos.done && count > 0) || (count < 0))
      throw new Error(`out of bounds`)
    if (count === 0)
      return pos
    --count
  }
}

