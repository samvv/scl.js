
import { UnorderedContainer } from "./Unordered"
import { UniqueContainer } from "./Unique"

export interface Set<T> extends UnorderedContainer<T>, UniqueContainer<T> {

}

