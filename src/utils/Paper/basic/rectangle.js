import { Point, Size } from '../basic'

export class Rectangle {
  _class = 'Rectangle'

  _x = 0
  _y = 0
  _width = 0
  _height = 0

  get x() {
    return this._x
  }

  set x(x) {
    this._x = x
  }

  get y() {
    return this._y
  }

  set y(y) {
    this._y = y
  }

  get width() {
    return this._width
  }

  set width(width) {
    this._width = width
  }

  get height() {
    return this._height
  }

  set height(height) {
    this._height = height
  }

  get topLeft() {
    return new Point(this.x, this.y)
  }

  get topRight() {
    return new Point(this.x + this.width, this.y)
  }

  get bottomLeft() {
    return new Point(this.x, this.y + this.height)
  }

  get bottomRight() {
    return new Point(this.x + this.width, this.y + this.height)
  }

  get corners() {
    const { topLeft, topRight, bottomRight, bottomLeft } = this
    return [topLeft, topRight, bottomRight, bottomLeft]
  }

  /**
   * The top-left point of rectangle
   */
  get point() {
    return new Point(this.x, this.y)
  }

  /** @param {Point} point */
  set point(point) {
    this.x = point.x
    this.y = point.y
  }

  get size() {
    return new Size(this.width, this.height)
  }

  /** @param {Size} size*/
  set size(size) {
    this.width = size.width
    this.height = size.height
  }

  get centerX() {
    return this.x + this.width / 2
  }

  _fw = 1
  _fh = 1

  /** @param {number} x */
  set centerX(x) {
    if (this._fw || this._sx === 0.5) {
      this.x = x - this.width / 2
    } else {
      if (this._sx) {
        this.x += (x - this.x) * 2 * this._sx
      }
      this.width = (x - this.x) * 2
    }
    this._sx = 0.5
    this._fw = 0
  }

  get centerY() {
    return this.y + this.height / 2
  }

  /** @param {number} x */
  set centerY(y) {
    if (this._fh || this._sy === 0.5) {
      this.y = y - this.height / 2
    } else {
      if (this._sy) {
        this.y += (y - this.y) * 2 * this._sy
      }
      this.height = (y - this.y) * 2
    }
    this._sy = 0.5
    this._fh = 0
  }

  get center() {
    return new Point(this.centerX, this.centerY)
  }

  set center(point) {
    this.setCenter(point)
  }

  get left() {
    return this.x
  }

  set left(left) {
    if (!this._fw) {
      const amount = left - this.x
      this.width -= this._sx === 0.5 ? amount * 2 : amount
    }
    this.x = left
    this._sx = this._fw = 0
  }

  get right() {
    return this.x + this.width
  }

  set right(right) {
    if (!this._fw) {
      const amount = right - this.x
      this.width = this._sx === 0.5 ? amount * 2 : amount
    }
    this.x = right - this.width
    this._sx = 1
    this._fw = 0
  }

  get top() {
    return this.y
  }

  set top(top) {
    if (!this._fh) {
      const amount = top - this.y
      this.height -= this._sy === 0.5 ? amount * 2 : amount
    }
    this.y = top
    this._sy = this._fh = 0
  }

  get bottom() {
    return this.y + this.height
  }

  set bottom(bottom) {
    if (!this._fh) {
      const amount = bottom - this.y
      this.height = this._sy === 0.5 ? amount * 2 : amount
    }
    this.y = bottom - this.height
    this._sy = 1
    this._fh = 0
  }

  /** @param {Point} point */
  setCenter(point) {
    this.centerX = point.x
    this.centerY = point.y

    return this
  }

  clone() {
    return new Rectangle(this.x, this.y, this.width, this.height)
  }

  /** @param {Rectangle} rect */
  equals(rect) {
    return (
      this.x === rect.x &&
      this.y === rect.y &&
      this.width === rect.width &&
      this.height === rect.height
    )
  }

  export() {
    const { x, y, width, height } = this
    return { x, y, width, height }
  }

  /**
   *
   * @param  {[Rectangle] | [Size] | [Point, Size] | [Point, Point]} args
   */
  constructor(...args) {
    if (args[0] instanceof Rectangle) {
      const rect = args[0]

      this.point = rect.point.clone()
      this.size = rect.size.clone()
    } else if (args[0] instanceof Size) {
      const size = args[0]

      this.point = new Point(0, 0)
      this.size = size.clone()
    } else if (args[0] instanceof Point && args[1] instanceof Size) {
      const point = args[0]
      const size = args[1]

      this.point = point.clone()
      this.size = size.clone()
    } else if (args[0] instanceof Point && args[1] instanceof Point) {
      const point1 = args[0]
      const point2 = args[1]

      const [x1, y1] = point1.values
      const [x2, y2] = point2.values

      const ascending = (a, b) => a - b
      const [minX, maxX] = [x1, x2].sort(ascending)
      const [minY, maxY] = [y1, y2].sort(ascending)

      this.point = new Point(minX, minY)
      this.size = new Size(maxX - minX, maxY - minY)
    } else {
      const [x, y, width, height] = args

      this.x = x || 0
      this.y = y || 0
      this.width = width || 0
      this.height = height || 0
    }
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  _set(x, y, width, height) {
    this._x = x
    this._y = y
    this._width = width
    this._height = height
  }
}

export class LinkedRectangle extends Rectangle {
  _class = 'LinkedRectangle'

  /**
   *
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {import('..').Item} owner
   * @param {string} setter
   */
  constructor(x, y, width, height, owner, setter) {
    super()
    this._set(x, y, width, height, false)
    this._owner = owner
    this._setter = setter

    // 속성을 하나씩 말고 한꺼번에 업데이트할 때 사용
    this._notify = true
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  _set(x, y, width, height, notify = true) {
    this._x = x
    this._y = y
    this._width = width
    this._height = height

    if (notify) this._changed()
  }

  /**
   * Rectangle 속성 변경을 자신을 가지고 있는 Item에 알려줌
   */
  _changed() {
    if (this._notify) this._owner?.[this._setter](this)
  }

  get x() {
    return this._x
  }

  set x(x) {
    this._x = x
    this._changed()
  }

  get y() {
    return this._y
  }

  set y(y) {
    this._y = y
    this._changed()
  }

  get width() {
    return this._width
  }

  set width(width) {
    this._width = width
    this._changed()
  }

  get height() {
    return this._height
  }

  set height(height) {
    this._height = height
    this._changed()
  }

  /**
   * The top-left point of rectangle
   */
  get point() {
    return super.point
  }

  /** @param {Point} point */
  set point(point) {
    this._notify = false

    super.point = point

    this._notify = true
    this._changed()
  }

  get size() {
    return super.size
  }

  /** @param {Size} size*/
  set size(size) {
    this._notify = false

    super.size = size

    this._notify = true
    this._changed()
  }

  _fw = 1
  _fh = 1

  get centerX() {
    return super.centerX
  }

  /** @param {number} x */
  set centerX(x) {
    this._notify = false

    super.centerX = x

    this._notify = true
    this._changed()
  }

  get centerY() {
    return super.centerY
  }

  /** @param {number} x */
  set centerY(y) {
    this._notify = false

    super.centerY = y

    this._notify = true
    this._changed()
  }

  get center() {
    return super.center
  }

  set center(point) {
    this.setCenter(point)
  }

  get left() {
    return super.left
  }

  set left(left) {
    this._notify = false

    super.left = left

    this._notify = true
    this._changed()
  }

  get right() {
    return super.right
  }

  set right(right) {
    this._notify = false

    super.right = right

    this._notify = true
    this._changed()
  }

  get top() {
    return super.top
  }

  set top(top) {
    this._notify = false

    super.top = top

    this._notify = true
    this._changed()
  }

  get bottom() {
    return this.y + this.height
  }

  set bottom(bottom) {
    this._notify = false

    super.bottom = bottom

    this._notify = true
    this._changed()
  }

  /** @param {Point} point */
  setCenter(point) {
    this._notify = false

    this.centerX = point.x
    this.centerY = point.y

    this._notify = true
    this._changed()
    return this
  }
}
