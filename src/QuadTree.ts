import { AddResult, Cursor, Index, Range } from "./interfaces.js";
import { isEqual, todo } from "./util.js";

export type Vec2 = [x: number, y: number];

export namespace Vec2 {

  export function isStrictEqual(a: Vec2, b: Vec2): boolean {
    return a[0] === b[0] && a[1] === b[1];
  }

  export function distance([x0, y0]: Vec2, [x1, y1]: Vec2): number {
    return Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
  }

}

type Value<T> = [
  position: Vec2,
  data: T,
]

export class Rect {

  public constructor(
    public topLeft: Vec2,
    public bottomRight: Vec2,
  ) {

  }

  public get top(): number {
    return this.topLeft[1];
  }

  public get left(): number {
    return this.topLeft[0];
  }

  public get bottom(): number {
    return this.bottomRight[1];
  }

  public get right(): number {
    return this.bottomRight[0];
  }

  public contains([x, y]: Vec2): boolean {
    return (this.topLeft[0] <= x && x <= this.bottomRight[0])
        || (this.topLeft[1] <= y && y <= this.bottomRight[1]);
  }

  public static fromPositionAndSize(left: number, top: number, width: number, height: number): Rect {
    return new Rect([ left, top ], [ left + width, top + height ]);
  }

  public static fromPoints(topLeft: Vec2, bottomRight: Vec2): Rect {
    return new Rect(topLeft, bottomRight);
  }

}

class Node<T> {

  public constructor(
    public shape: Rect,
    public values: Array<Value<T>> = [],
    public topLeft?: Node<T>,
    public topRight?: Node<T>,
    public bottomLeft?: Node<T>,
    public bottomRight?: Node<T>,
  ) {

  }

}

export class QuadTreeCursor<T> implements Cursor<[Vec2, T]> {

  public constructor(
    public readonly value: [Vec2, T],
  ) {

  }

  public get point(): Vec2 {
    return this.value[0];
  }

  public get data(): T {
    return this.value[1];
  }

  public setData(newData: T): void {
    this.value[1] = newData;
  }

}

export type QuadTreeOptions<T> = {
  elementsEqual?: (a: T, b: T) => boolean;
  shape: Rect;
  elements?: Iterable<[Vec2, T]>;
  minX?: number;
  minY?: number;
}

export class QuadTree<T> implements Index<[Vec2, T], Vec2> {

  public readonly shape: Rect;

  private root: Node<T>;
  private minX: number;
  private minY: number;
  private count = 0;
  private elementsEqual: (a: T, b: T) => boolean;

  public constructor(opts: QuadTreeOptions<T>) {
    this.shape = opts.shape ?? new Rect([ -Infinity, -Infinity ], [ Infinity, Infinity ]);
    this.elementsEqual = opts.elementsEqual ?? isEqual;
    this.root = new Node<T>(this.shape);
    this.minX = opts.minX ?? 1.0;
    this.minY = opts.minY ?? 1.0;
    if (opts.elements !== undefined) {
      for (const element of opts.elements) {
        this.add(element);
      }
    }
  }

  public add([point, data]: [Vec2, T]): AddResult<[Vec2, T], QuadTreeCursor<T>> {
    return this.insert(point, data);
  }

  public insert(point: Vec2, value: T): AddResult<[Vec2, T], QuadTreeCursor<T>> {

    let curr = this.root;

    for (;;) {

      const { top, left, bottom, right } = curr.shape;

      if  (Math.abs(left - right) <= this.minX
          && Math.abs(top - bottom) <= this.minY) {
        const pair: [Vec2, T] = [point, value];
        curr.values.push(pair);
        this.count++;
        return [ true, new QuadTreeCursor(pair) ];
      }

      if ((left + right) / 2 >= point[0]) {

        if ((top + bottom) / 2 >= point[1]) {
          if (curr.topLeft === undefined) {
            curr.topLeft = new Node<T>(
              new Rect(
                [ left, top ],
                [ (left + right) / 2, (top + bottom) / 2 ],
              )
            );
          }
          curr = curr.topLeft;
        } else {
          if (curr.bottomLeft === undefined) {
            curr.bottomLeft = new Node<T>(
              new Rect(
                [ left, (top + bottom) / 2 ],
                [ (left + right) / 2, bottom ],
              )
            );
          }
          curr = curr.bottomLeft;
        }

      } else {

        if ((top + bottom) / 2 >= point[1]) {
          if (curr.topRight === undefined) {
            curr.topRight = new Node<T>(
              new Rect(
                [ (left  + right) / 2, top ],
                [ right, (top + bottom) / 2 ],
              )
            );
          }
          curr = curr.topRight;
        } else {
          if (curr.bottomRight === undefined) {
            curr.bottomRight = new Node<T>(
              new Rect(
                [ (left + right) / 2, (top + bottom) / 2 ],
                [ right, bottom ],
              )
            );
          }
          curr = curr.bottomRight;
        }

      }
    }

  }

  public findNode(point: Vec2): Node<T> | undefined {
    if (!this.root.shape.contains(point)) {
      return;
    }
    let curr = this.root;
    const [x ,y] = point;
    for (;;) {
      const { top, left, bottom, right } = curr.shape;
      if ((left + right) / 2 >= x) {
        if ((top + bottom) / 2 >= y) {
          if (curr.topLeft === undefined) {
            break;
          }
          curr = curr.topLeft;
        } else {
          if (curr.bottomLeft === undefined) {
            break;
          }
          curr = curr.bottomLeft;
        }
      } else {
        if ((top + bottom) / 2 >= y) {
          if (curr.topRight === undefined) {
            break;
          }
          curr = curr.topRight;
        } else {
          if (curr.bottomRight === undefined) {
            break;
          }
          curr = curr.bottomRight;
        }
      }
    }
    return curr;
  }

  public hasKey(point: Vec2): boolean {
    return this.findKey(point) !== undefined;
  }

  public has([point, value]: [Vec2, T]): boolean {
    for (const [_, value2] of this.equalKeys(point)) {
      if (this.elementsEqual(value, value2)) {
        return true;
      }
    }
    return false;
  }

  public *equalKeys(point: Vec2): Iterable<[Vec2, T]> {
    const node = this.findNode(point);
    if (node === undefined) {
      return;
    }
    for (const [point2, data] of node.values) {
      if (Vec2.isStrictEqual(point, point2)) {
        yield [point2, data];
      }
    }
  }

  public findKey(point: Vec2): QuadTreeCursor<T> | undefined {
    const node = this.findNode(point);
    if (node === undefined) {
      return;
    }
    for (const pair of node.values) {
      if (Vec2.isStrictEqual(point, pair[0])) {
        return new QuadTreeCursor(pair);
      }
    }
  }

  public findNearest(point: Vec2): T | undefined {
    const node = this.findNode(point);
    if (node === undefined) {
      return;
    }
    const list: Array<[number, T]> = [];
    for (const pair of node.values) {
      list.push([ Vec2.distance(pair[0], point), pair[1] ]);
    }
    list.sort((a, b) => b[0] - a[0]);
    console.log(list);
    return list[0][1];
  }

  public delete(element: [Vec2, T]): boolean {
     todo();
  }

  public deleteAll(element: [Vec2, T]): number {
    todo();
  }

  public deleteAt(position: QuadTreeCursor<T>): void {
    todo();
  }

  public deleteKey(key: Vec2): number {
    todo();
  }

  public toRange(): Range<[Vec2, T]> {
    todo();
  }

  public *[Symbol.iterator](): IterableIterator<[Vec2, T]> {
    let stack = [ this.root ];
    do {
      const curr = stack.pop()!;
      yield* curr.values;
      if (curr.topLeft) {
        stack.push(curr.topLeft);
      }
      if (curr.bottomLeft) {
        stack.push(curr.bottomLeft);
      }
      if (curr.topRight) {
        stack.push(curr.topRight);
      }
      if (curr.bottomRight) {
        stack.push(curr.bottomRight);
      }
    } while (stack.length > 0);
  }

  public clone(): QuadTree<T> {
     return new QuadTree({
       shape: this.shape,
       elements: this,
       elementsEqual: this.elementsEqual,
       minX: this.minX,
       minY: this.minY,
     });
  }

  public clear(): void {
     this.root = new Node<T>(this.shape);
     this.count = 0;
  }

  public get size(): number {
    return this.count;
  }

}
