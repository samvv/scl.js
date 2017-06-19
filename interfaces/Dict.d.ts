
import { Container } from "./Container"

export interface Pair<K, V> {
  key: K
  value: V
}

export interface Dict<K, V> extends Container<Pair<K, V>> {
  addPair(key: K, value: V)
  hasKey(key: K)
  getValue(key: K)
  hasValue(value: V)
  deleteKey(key: K)
  deleteValues(value: V)
}

