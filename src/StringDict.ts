
import { CollectionRange, Cursor, Dict, Pair } from "./interfaces";
import { CursorBase, RangeBase } from "./util";

class ObjectCursor<V> extends CursorBase<[string, V]> {

  constructor(public _dict: StringDict<V>, public key: string) {
    super();
  }

  get value() {
    return [this.key, this._dict._values[this.key]];
  }

  set value(newValue: [string, V]) {
    this._dict._values[this.key] = newValue[1];
  }

}

class ObjectRange<V> extends RangeBase<[string, V]> {

  constructor(public _dict: StringDict<V>) {
    super();
  }

  get size() {
    return this._dict.size;
  }

  public [Symbol.iterator]() {
    return this._dict[Symbol.iterator]();
  }

  public *cursors() {
    for (const key of Object.keys(this._dict._values)) {
      yield new ObjectCursor<V>(this._dict, key);
    }
  }

}

/**
 * A hash-based dictionary for strings, which wraps a native JavaScript object
 * to provide very fast lookup, insertion and deletion.
 *
 * ```ts
 * import { StringDict } from "scl"
 * ```
 *
 * When two items are added with the same key, the second item will
 * override the first.
 *
 * ```ts
 * const d = new StringDict<number>()
 * d.add(1, 'one') // ok
 * d.add(1, 'two') // ok; replaced
 * assert.strictEqual(d.getValue(1), 'two')
 * ```
 *
 * All operations in the dictionary are in `O(1)`.
 */
export class StringDict<V> implements Dict<string, V> {

  /**
   * @ignore
   */
  public _values = Object.create(null);

  protected _size = 0;

  /**
   * Construct a new string-based dictionary.
   *
   * ```ts
   * const d = new StringDict<number>()
   * ```
   *
   * You can also constrcut this dictionary from any iterable, like so:
   *
   * ```ts
   * const d = new StringDict([
   *   ['one', 1],
   *   ['two', 2]
   * ])
   * ```
   */
  constructor(iterable?: Iterable<[string, V]>) {
    if (iterable !== undefined) {
      for (const element of iterable) {
        this.add(element);
      }
    }
  }

  public add([key, val]: Pair<string, V>) {
    return this.emplace(key, val);
  }

  get size() {
    return this._size;
  }

  public has(element: Pair<string, V>) {
    const value = this._values[element[0]];
    return value !== undefined
        && element[1] === value;
  }

  public emplace(key: string, value: V): [boolean, Cursor<[string, V]>] {
    if (this._values[key] !== undefined) {
      return [false, new ObjectCursor<V>(this, key)];
    }
    this._values[key] = value;
    this._size++;
    return [true, new ObjectCursor<V>(this, key)];
  }

  public getValue(key: string) {
    const value = this._values[key];
    if (value === undefined) {
      throw new Error(`key ${key} not found`);
    }
    return value;
  }

  public hasKey(key: string) {
    return this._values[key] !== undefined;
  }

  public *[Symbol.iterator](): IterableIterator<[string, V]> {
    for (const key of Object.keys(this._values)) {
      yield [key, this._values[key]];
    }
  }

  public delete(pair: Pair<string, V>) {
    if (!Object.prototype.hasOwnProperty.call(this._values, pair[0])) {
      return false;
    }
    delete this._values[pair[0]];
    this._size--;
    return true;
  }

  public deleteKey(key: string) {
    if (!Object.prototype.hasOwnProperty.call(this._values, key)) {
      return 0;
    }
    delete this._values[key];
    this._size--;
    return 1;
  }

  public findKey(key: string) {
    return new ObjectCursor<V>(this, key);
  }

  public deleteAt(cursor: ObjectCursor<V>) {
    delete this._values[cursor.key];
    this._size--;
  }

  public deleteAll(element: [string, V]) {
    let count = 0;
    for (const key of Object.keys(this._values)) {
      if (key === element[0] && this._values[key] === element[1]) {
        delete this._values[key];
        count++;
      }
    }
    this._size -= count;
    return count;
  }

  public toRange() {
    return new ObjectRange<V>(this);
  }

  public clear() {
    this._values = Object.create(null);
  }

  public clone() {
    return new StringDict<V>(Object.assign(Object.create(null), this._values));
  }

}

export default StringDict;
