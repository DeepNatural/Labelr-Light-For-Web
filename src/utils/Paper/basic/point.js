export class Point {
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }

  clone() {
    return new Point(this.x, this.y)
  }

  /** @return {[number, number]} */
  get values() {
    return [this.x, this.y]
  }

  /** @param {Point | number} point*/
  add(point) {
    if (point instanceof Point)
      return new Point(this.x + point.x, this.y + point.y)
    else return new Point(this.x + point, this.y + point)
  }

  /** @param {Point | number} point*/
  subtract(point) {
    if (point instanceof Point)
      return new Point(this.x - point.x, this.y - point.y)
    else return new Point(this.x - point, this.y - point)
  }

  /** @param {Point | number} point*/
  multiply(point) {
    if (point instanceof Point)
      return new Point(this.x * point.x, this.y * point.y)
    else return new Point(this.x * point, this.y * point)
  }

  /** @param {Point | number} point*/
  divide(point) {
    if (point instanceof Point)
      return new Point(this.x / point.x, this.y / point.y)
    else return new Point(this.x / point, this.y / point)
  }

  /** @param {Point | number} point*/
  modulo(point) {
    if (point instanceof Point)
      return new Point(this.x % point.x, this.y % point.y)
    else return new Point(this.x % point, this.y % point)
  }

  negate() {
    return new Point(-this.x, -this.y)
  }

  /** @param {Point} point*/
  equals(point) {
    return point.x === this.x && point.y === this.y
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  /**
   * @param {Point} lineStart
   * @param {Point} lineEnd
   */
  closestPointInLine(lineStart, lineEnd) {
    const atob = lineEnd.subtract(lineStart)
    const atop = this.subtract(lineStart)
    const len = atob.x * atob.x + atob.y * atob.y
    let dot = atop.x * atob.x + atop.y * atob.y
    const t = Math.min(1, Math.max(0, dot / len))

    dot =
      (lineEnd.x - lineStart.x) * (this.y - lineStart.y) -
      (lineEnd.y - lineStart.y) * (this.x - lineStart.x)

    return new Point(lineStart.x + atob.x * t, lineStart.y + atob.y * t)
  }

  export() {
    const { x, y } = this
    return { x, y }
  }
}
