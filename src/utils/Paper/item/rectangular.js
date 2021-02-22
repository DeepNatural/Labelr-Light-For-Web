import { Item, HitResult } from './item'
import { Size, Point, Matrix, Rectangle } from '../basic'

export class Rectangular extends Item {
  _class = 'Rectangular'

  /** @type {Size} */
  size = null

  // /** @type {Point} */
  // position = null

  constructor(...args) {
    super()

    if (args[0] instanceof Rectangular) {
      const rect = args[0]

      this.position = rect.position.clone()
      this.size = rect.size.clone()
    } else if (args[0] instanceof Point && args[1] instanceof Size) {
      const point = args[0]
      const size = args[1]

      this.position = point.clone()
      this.size = size.clone()
    } else if (args[0] instanceof Point && args[1] instanceof Point) {
      const point1 = args[0]
      const point2 = args[1]

      const [x1, y1] = point1.values
      const [x2, y2] = point2.values

      const ascending = (a, b) => a - b
      const [minX, maxX] = [x1, x2].sort(ascending)
      const [minY, maxY] = [y1, y2].sort(ascending)

      this.position = new Point(minX, minY)
      this.size = new Size(maxX - minX, maxY - minY)
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  _draw(ctx) {
    const { x, y } = this.position
    const { width, height } = this.size

    ctx.beginPath()
    ctx.strokeRect(x, y, width, height)
    ctx.rect(x, y, width, height)
    if (this.style.fillColor) ctx.fillRect(x, y, width, height)
    ctx.closePath()
  }

  /** @param {Point} point */
  _hitTest(point, options) {
    const { x, y } = this.position
    const { width, height } = this.size

    const path = new Path2D()
    path.rect(x, y, width, height)

    const collided = this.context.isPointInStroke(path, point.x, point.y)
      ? 'stroke'
      : this.context.isPointInPath(path, point.x, point.y)
      ? 'fill'
      : ''

    if (collided) return new HitResult(collided, this)

    return null
  }

  /** @param {Matrix} matrix */
  _getBounds(matrix) {
    let rect = new Rectangle(this.size).setCenter(new Point(0, 0))

    if (matrix) rect = matrix._transformBounds(rect)

    return rect
  }
}
