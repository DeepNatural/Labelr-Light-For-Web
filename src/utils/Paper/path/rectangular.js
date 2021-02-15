import { Path, Segment } from '../path'
import { Point, Size, Rectangle } from '../basic'

export class Rectangular extends Path {
  _class = 'Rectangular'

  /** @type {Size} */
  size = null

  get area() {
    return this.size.width * this.size.height
  }

  /**
   *
   * @param  {[Rectangle] | [Point, Size] | [Point, Point]} args
   */
  constructor(...args) {
    super()

    if (args[0] instanceof Rectangle) {
      const rect = args[0]
      this.bounds = rect
    } else if (args[0] instanceof Point && args[1] instanceof Size) {
      const point = args[0]
      const size = args[1]
      const rect = new Rectangle(size).setCenter(point)
      this.bounds = rect
    } else if (args[0] instanceof Point && args[1] instanceof Point) {
      const point1 = args[0]
      const point2 = args[1]

      const [x1, y1] = point1.values
      const [x2, y2] = point2.values

      const ascending = (a, b) => a - b
      const [minX, maxX] = [x1, x2].sort(ascending)
      const [minY, maxY] = [y1, y2].sort(ascending)

      const point = new Point(minX, minY)
      const size = new Size(maxX - minX, maxY - minY)
      const rect = new Rectangle(point, size)

      this.bounds = rect
    }
  }

  get bounds() {
    return super.bounds
  }

  /** @param {Rectangle} bounds */
  set bounds(bounds) {
    this._setBounds(bounds)
  }

  /** @param {Rectangle} rect */
  setSegments(rect) {
    // 단순 세그먼트 포인트 변경
    if (this._segments.length === 4)
      return new Rectangle(rect.size).corners.forEach((point, i) => {
        this._segments[i].point = point
      })

    // 새 세그먼트 추가
    this.removeSegments()
    const segments = new Rectangle(rect.size).corners.map(
      point => new Segment(point)
    )
    this.add(segments)
    this.closePath()
  }

  _setBounds(bounds) {
    this.setSegments(bounds)
    this.position = bounds.center.clone()
    this.size = bounds.size.clone()
  }

  _getBounds() {
    if (!this._segments[0]) return new Rectangle()

    const point1 = this._segments[0]._transformedPoint(this._matrix)
    const point2 = this._segments[2]._transformedPoint(this._matrix)

    const rect = new Rectangle(point1, point2)

    return rect
  }

  export() {
    return this.bounds.export()
  }
}
