
import { OrderedContainer } from "./Ordered"
import { UniqueContainer } from "./Unique"

export interface Set<T> extends OrderedContainer<T>, UniqueContainer<T> { }

