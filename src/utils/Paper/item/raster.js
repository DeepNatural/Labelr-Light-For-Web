import { Point, Rectangle, Size } from '../basic'
import { Item } from './item'

export class Raster extends Item {
  _class = 'Raster'

  /** @type {HTMLImageElement | HTMLCanvasElement} */
  _image = null

  get image() {
    return this._image
  }

  get loaded() {
    return this._loaded
  }

  /**
   * @type {HTMLCanvasElement}
   */
  get canvas() {
    return this.getContext ? this.image : null
  }

  /**
   * @param {HTMLImageElement | HTMLCanvasElement | string} source
   * @param {Point} position
   */
  constructor(source, position = new Point(0, 0)) {
    super()

    this.position = position

    if (typeof source === 'string') {
      this._image = new Image()
      this._image.src = source
      this._image.onload = () => {
        this.onload?.()
        this._loaded = true
        this.size = new Size(this._image.width, this._image.height)
      }
      this._image.onerror = () => this.onerror?.()
    } else {
      this._image = source
      this.size = new Size(this._image.width, this._image.height)
      this._loaded = true
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  _draw(ctx) {
    if (!this.loaded) return

    const { width, height } = this.size

    ctx.drawImage(this.image, -width / 2, -height / 2)
  }

  _drawHandle(ctx) { }

  /** @param {Point} point */
  _hitTest(point) {
    if (!this.size) return

    const [x1, y1] = this.position.values
    const [x2, y2] = [x1 + this.size.width, y1 + this.size.height]

    if (x1 <= point.x && point.x <= x2 && y1 <= point.y && point.y <= y2)
      return this

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
