
type Vec2 = [number, number]

export interface Grid<T> {
  width: number
  height: number
  get([x,y]: Vec2): T
  set([x,y]: Vec2, val: T): void
  delete([x,y]: Vec2): void
  has([x,y]: Vec2): boolean
}

