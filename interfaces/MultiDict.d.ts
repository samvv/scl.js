
import UnorderedContainer from "./Unordered"
import MultiContainer from "./Multi"
import { Pair } from "./Dict"

export interface MultiDict<K, V> extends MultiContainer<Pair<K, V>>, UnorderedContainer<Pair<K, V>> {
  hasKey(key: K): boolean
  hasValue(value: V): boolean
  getValues(key: K): V[]
  deleteKeys(key: K): void
  deleteValues(value: V): void
}

