
export type Vec2 = [number, number]

export namespace Vec2 {

  export function add(a: Vec2, b: Vec2): Vec2 {
    return [a[0]+b[0], a[1]+b[1]]
  }

  export function max(a: Vec2, b: Vec2): Vec2 {
    return [Math.max(a[0],b[0]), Math.max(a[1],b[1])]
  }

}

export type Mat2d = [number, number, number, number, number, number]

export namespace Mat2d {
  
  export function identity(): Mat2d {
    return [1,0,0,1,0,0]
  }

  export function add(a: Mat2d, b: Mat2d) {
    return [
      a[0] + b[0],
      a[1] + b[1],
      a[2] + b[2],
      a[3] + b[3],
      a[4] + b[4],
      a[5] + b[5],
    ]
  }

  export function scale(a: Mat2d, v: Vec2): Mat2d {
   const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
         v0 = v[0], v1 = v[1];
    return [
      a0 * v0,
      a1 * v0,
      a2 * v1,
      a3 * v1,
      a4,
      a5,
    ]
  }

  export function rotate(a: Mat2d, rad: number): Mat2d {
    const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
          s = Math.sin(rad),
          c = Math.cos(rad);
    return [
      a0 *  c + a2 * s,
      a1 *  c + a3 * s,
      a0 * -s + a2 * c,
      a1 * -s + a3 * c,
      a4,
      a5,
    ]
  }

  export function translate(a: Mat2d, v: Vec2): Mat2d {
    const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
          v0 = v[0], v1 = v[1];
    return [
      a0,
      a1,
      a2,
      a3,
      a0 * v0 + a2 * v1 + a4,
      a1 * v0 + a3 * v1 + a5,
    ]
  }

}

export function max(...els) {
  let res = 0
  for (const el of els)
    res = Math.max(el, res)
  return res
}

export function add(...els) {
  let res = 0
  for (const el of els)
    res += el
  return res
}

