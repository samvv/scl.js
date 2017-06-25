
export type Vec2 = [number, number]

export namespace Vec2 {

  export function add(a: Vec2, b: Vec2): Vec2 {
    return [a[0]+b[0], a[1]+b[1]]
  }

  export function max(a: Vec2, b: Vec2): Vec2 {
    return [Math.max(a[0],b[0]), Math.max(a[1],b[1])]
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

