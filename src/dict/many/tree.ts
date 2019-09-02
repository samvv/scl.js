
import MultiTreeDict from "../multi/tree"
import { Cursor } from "../../interfaces"
import { lesser, equal } from "../../util"

export class TreeDict<K, V> extends MultiTreeDict<K, V> {

  constructor(
      keyLessThan: (a: K, b: K) => boolean = lesser
    , valuesEqual: (a: V, b: V) => boolean = equal
  ) {
    super(keyLessThan, valuesEqual);
  }

  add(pair: [K, V]): [boolean, Cursor<[K, V]>] {
    for (const node of this.equalKeys(pair[0])) {
      if (this.valuesEqual(pair[1], node.value[1])) {
        node.value = pair;
        return [false, node];
      }
    }
    return super.add(pair) as [boolean, Cursor<[K, V]>];
  }

}

export default TreeDict;

