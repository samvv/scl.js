
import { DictBase } from "./DictBase.js";
import RBTreeIndex from "./RBTreeIndex.js";
import { TreeDictOptions } from "./TreeDict.js";
import { isEqual, isIterable, lessThan } from "./util.js";

function parseTreeDictOptions<K, V>(arg0: Iterable<[K, V]> | TreeDictOptions<K, V>) {
  const opts: TreeDictOptions<K, V> & { elements?: Iterable<[K, V]> }
    = isIterable(arg0)
      ? { elements: arg0 }
      : arg0;
  return {
    compareKeys: opts.compareKeys ?? lessThan,
    valuesEqual: opts.valuesEqual ?? isEqual,
    elements: opts.elements ?? [],
  };
}

export class RBTreeDict<K, V> extends DictBase<K, V> {

  /**
   * Construct a new tree-based dictionary.
   *
   * ```ts
   * const d = new TreeDict<number, string>()
   * ```
   *
   * Similar to JavaScript's built-in [map type][1], the constructor accepts a
   * list of key-value pairs that will immediately be added to the resulting
   * dictionary.
   *
   * ```ts
   * const d = new TreeDict<number, string>([
   *   [1, 'one'],
   *   [2, 'two']
   * ])
   * ```
   *
   * The dictionary can be tweaked by providing a {@link TreeDictOptions}-object,
   * which allows to configure things like the default compare function and
   * value equality.
   *
   * ```ts
   * const d = new TreeDict<number, string>({
   *   compareKeys: (a, b) => a < b,
   *   valuesEqual: (a, b) => a === b,
   *   elements: [[1, 'one'], [2, 'two']]
   * })
   * ```
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
   */
  constructor(opts: Iterable<[K, V]> | RBTreeDict<K, V> | TreeDictOptions<K, V> = {}) {
    if (opts instanceof RBTreeDict) {
      super(opts);
    } else {
      const {
        elements,
        valuesEqual,
        compareKeys,
      } = parseTreeDictOptions(opts);
      super(
        new RBTreeIndex<[K, V], K>({
          elements,
          compareKeys,
          getKey: pair => pair[0],
          isEqual: (a, b) => valuesEqual(a[1], b[1]),
        })
      );
    }
  }

  public clone(): RBTreeDict<K, V> {
    return new RBTreeDict<K, V>(this.index.clone());
  }

}
