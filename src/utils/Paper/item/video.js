import { Item, HitResult } from '../item'
import { Size, Point, Matrix, Rectangle } from '../basic'

export class Video extends Item {
  _class = 'Video'

  /**
   * @param {HTMLVideoElement | string} source
   */
  constructor(source) {
    super()

    if (source instanceof HTMLVideoElement) {
      this.source = source
      this.size = new Size(source.offsetWidth, source.offsetHeight)
      this.source.onresize = () => this.setSize()
    } else if (source instanceof String) {
      this.source = new HTMLVideoElement()
      this.source.src = source
      this.source.onresize = () => this.setSize()
      this.source.onload = () => this.setSize()
    }
  }

  get loaded() {
    return this.source.readyState === 4
  }

  setSize(e) {
    const [width, height] = [this.source.videoWidth, this.source.videoHeight]
    this.size = new Size(width, height)
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  _draw(ctx) {
    if (!this.loaded) return

    const { width, height } = this.size
    ctx.drawImage(this.source, -width / 2, -height / 2)
  }

  _drawHandle(ctx) {}

  /**
   *
   * @param {Point} point
   * @param {import('..').HitOpitons} options
   */
  _hitTest(point, options) {
    if (!options?.video) return

    const { x, y } = this.position
    const { width, height } = this.size

    const path = new Path2D()
    path.rect(x, y, width, height)

    const collided = this.context.isPointInPath(path, point.x, point.y)
      ? 'fill'
      : ''

    if (collided) return new HitResult(collided, this)

    return null
  }

  /**
   *
   * @param {Matrix} matrix
   */
  _getBounds(matrix) {
    let rect = new Rectangle(this.size).setCenter(new Point(0, 0))

    if (matrix) rect = matrix._transformBounds(rect)

    return rect
  }
}
