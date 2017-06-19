
import { Container } from "./Container"
import { Pair } from "./Dict"

export interface MultiDict<K, V> extends Container<Pair<K, V>> {
  hasKey(key: K)
  hasValue(value: V)
  deleteKeys(key: K)
  deleteValues(value: V)
}

