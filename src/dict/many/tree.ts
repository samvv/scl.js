
// import MultiTreeDict from "../multi/tree"
import AVL from "../../avl"
import { Cursor } from "../../interfaces"
import { lesser, equal } from "../../util"
import { MultiDict } from "../../interfaces"
import { TreeDictOptions } from "../tree"

export class TreeManyDict<K, V> extends AVL<[K, V], K> implements MultiDict<K, V> {

  static empty<K, V>(opts: TreeDictOptions<K, V> = {}) {
    const valuesEqual = opts.valuesEqual !== undefined ? opts.valuesEqual : equal;
    return new TreeManyDict<K, V>(
      opts.compare !== undefined ? opts.compare : lesser
    , pair => pair[0]
    , (a, b) => valuesEqual(a[1], b[1])
    , true
    );
  }

  static from<K, V>(iterable: Iterable<[K, V]>, opts?: TreeDictOptions<K, V>) {
    // FIXME might be able to optimise this
    const dict = TreeManyDict.empty(opts);
    for (const element of iterable) {
      dict.add(element);
    }
    return dict;
  }

  add(pair: [K, V]): [boolean, Cursor<[K, V]>] {
    for (const node of this.equalKeys(pair[0])) {
      if (this.elementsEqual(pair, node.value)) {
        node.value = pair;
        return [false, node];
      }
    }
    return super.add(pair) as [boolean, Cursor<[K, V]>];
  }

  *getValues(key: K) {
    for (const cursor of this.equalKeys(key)) {
      yield cursor.value[1];
    }
  }

  emplace(key: K, val: V) {
    return this.add([key, val]);
  }

  clone() {
    return new TreeManyDict<K, V>(
      this.lessThan
    , pair => pair[0]
    , this.elementsEqual
    , true
    );
  }

}

export default TreeManyDict;

