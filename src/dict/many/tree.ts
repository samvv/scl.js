
import { DictBase } from "../multi/base"
import MultiTreeDict from "../multi/tree"
import { lesser, liftLesser } from "../../util"

export class TreeDict<K, V> extends MultiTreeDict<K, V> {

  constructor(
      lessThan: (a: K, b: K) => boolean = lesser
    , valuesEqual = (a, b) => a === b) {
    super(lessThan, valuesEqual);
  }

  emplace(key: K, val: V) {
    return this.add([key, val]);
  }

  add(p: [K, V]) {
    console.log(this._nodesWithKey(p[0]))
    for (const node of this._nodesWithKey(p[0])) {
      if (this.isEqual(p, node.value)) {
        node.value = p;
        return [false, node];
      }
    }
    return super.add(p);
  }

}

export default TreeDict;

