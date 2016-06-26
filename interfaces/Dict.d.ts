
import { Container } from "./Container"

export interface Pair<K, V> {
  key: K
  value: V
}

export interface Dict<K, V> extends Container<Pair<K, V>> {
  hasKey(key: K)
  hasValue(value: V)
  removeKey(key: K)
  removeValues(value: V)
}

