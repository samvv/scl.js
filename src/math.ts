
export type Vec2 = [x: number, y: number];

export namespace Vec2 {

  export function isEqual(a: Vec2, b: Vec2): boolean {
    return a[0] === b[0] && a[1] === b[1];
  }

  export function distance([x0, y0]: Vec2, [x1, y1]: Vec2): number {
    return Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
  }

}

