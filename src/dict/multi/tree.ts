
import AVL from "../../avl"
import { lesser, equal } from "../../util"
import { MultiDict } from "../../interfaces"
import { TreeDictOptions } from "../tree"

export class TreeMultiDict<K, V> extends AVL<[K, V], K> implements MultiDict<K, V> {

  static empty<K, V>(opts: TreeDictOptions<K, V> = {}) {
    const valuesEqual = opts.valuesEqual !== undefined ? opts.valuesEqual : equal;
    return new TreeMultiDict<K, V>(
      opts.compare !== undefined ? opts.compare : lesser
    , pair => pair[0]
    , (a, b) => valuesEqual(a[1], b[1])
    , true
    );
  }

  static from<K, V>(iterable: Iterable<[K, V]>, opts?: TreeDictOptions<K, V>) {
    // FIXME might be able to optimise this
    const dict = TreeMultiDict.empty(opts);
    for (const element of iterable) {
      dict.add(element);
    }
    return dict;
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
    return new TreeMultiDict<K, V>(
      this.lessThan
    , pair => pair[0]
    , this.elementsEqual
    , true
    );
  }

}

export default TreeMultiDict;

