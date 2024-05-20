
import type { AddResult, Cursor, Dict, Index, Range } from "./interfaces.js"

export abstract class DictBase<K, V> implements Dict<K, V> {

  constructor(protected index: Index<[K, V], K>) {

  }

  public equalKeys(key: K): Range<[K, V]> {
    return this.index.equalKeys(key);
  }

  public getValue(key: K): V | undefined {
    const cursor = this.index.findKey(key);
    if (cursor === null) {
      return;
    }
    return cursor.value[1];
  }

  public emplace(key: K, value: V): [boolean, Cursor<[K, V]>] {
    return this.index.add([key, value]);
  }

  public hasKey(key: K): boolean {
    return this.index.hasKey(key);
  }

  public findKey(key: K): Cursor<[K, V]> | null {
    return this.index.findKey(key);
  }

  public deleteKey(key: K): number {
    return this.index.deleteKey(key);
  }

  public add(element: [K, V], hint?: any): AddResult<[K, V]> {
    return this.index.add(element, hint);
  }

  public has(element: [K, V]): boolean {
    return this.index.has(element);
  }

  public [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.index[Symbol.iterator]();
  }

  public get size(): number {
    return this.index.size;
  }

  public clear(): void {
    this.index.clear();
  }

  public abstract clone(): Dict<K, V>;

  public deleteAt(position: Cursor<[K, V]>): void {
    this.index.deleteAt(position);
  }

  public delete(element: [K, V]): boolean {
    return this.index.delete(element);
  }

  public deleteAll(element: [K, V]): number {
    return this.index.deleteAll(element);
  }

  public toRange(): Range<[K, V]> {
    return this.index.toRange();
  }

}
