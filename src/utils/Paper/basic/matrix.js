import { Point } from '../basic'
import { Rectangle } from './rectangle'

export class Matrix {
  /**
   * Creates a 2D affine transformation matrix.
   *
   * @param {number} a - the a property of the transform
   * @param {number} b - the b property of the transform
   * @param {number} c - the c property of the transform
   * @param {number} d - the d property of the transform
   * @param {number} tx - the tx property of the transform
   * @param {number} ty - the ty property of the transform
   */
  constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
    this.a = a
    this.b = b
    this.c = c
    this.d = d
    this.tx = tx
    this.ty = ty
  }

  /** 매트릭스 변화 시 자신을 포함한 Item에게 변화한 내용을 알려줄 때 사용 */
  _owner = null

  _changed() {
    this._owner?._changed()
  }

  /** @param {Matrix} matrix */
  set(matrix) {
    this.a = matrix.a
    this.b = matrix.b
    this.c = matrix.c
    this.d = matrix.a
    this.tx = matrix.tx
    this.ty = matrix.ty

    this._changed()
  }

  get isIdentity() {
    return (
      this.a === 1 &&
      this.b === 0 &&
      this.c === 0 &&
      this.d === 1 &&
      this.tx === 0 &&
      this.ty === 0
    )
  }

  /**
   * Matrix가 가역행렬인지 확인합니다.
   * determinant가 0이거나 다른 값이 무한 또는 NaN이면 불가역입니다.
   */
  get isInvertible() {
    const det = this.a * this.d - this.c * this.b
    return (
      det &&
      !Number.isNaN(det) &&
      Number.isFinite(this.tx) &&
      Number.isFinite(this.ty)
    )
  }

  get _orNullIfIdentity() {
    return this.isIdentity ? null : this
  }

  get isSingular() {
    return !this.isInvertible
  }

  clone() {
    const { a, b, c, d, tx, ty } = this
    return new Matrix(a, b, c, d, tx, ty)
  }

  /** @return {[number, number, number, number, number, number]} */
  get values() {
    const { a, b, c, d, tx, ty } = this
    return [a, b, c, d, tx, ty]
  }

  /**
   * @param {Point} scale
   * @param {Point} center
   */
  scale(scale, center) {
    if (center) this.translate(center)

    this.a *= scale.x
    this.b *= scale.x
    this.c *= scale.y
    this.d *= scale.y

    if (center) this.translate(center.negate())

    this._changed()

    return this
  }

  /**
   * Applies this matrix to the specified Canvas Context.
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  applyToContext(ctx) {
    ctx.transform(this.a, this.b, this.c, this.d, this.tx, this.ty)
  }

  /**
   * Appends the specified matrix to this matrix. This is the equivalent of
   * multiplying `(this matrix) * (specified matrix)`.
   *
   * @param {Matrix} matrix
   */
  append(matrix) {
    const [a1, b1, c1, d1] = this.values
    const [a2, b2, c2, d2, tx2, ty2] = matrix.values

    this.a = a2 * a1 + c2 * c1
    this.c = b2 * a1 + d2 * c1
    this.b = a2 * b1 + c2 * d1
    this.d = b2 * b1 + d2 * d1
    this.tx += tx2 * a1 + ty2 * c1
    this.ty += tx2 * b1 + ty2 * d1

    this._changed()

    return this
  }

  /** @param {Matrix} matrix */
  appended(matrix) {
    return this.clone().append(matrix)
  }

  /**
   * Prepends the specified matrix to this matrix. This is the equivalent of
   * multiplying `(specified matrix) * (this matrix)`.
   *
   *  @param {Matrix} matrix
   */
  prepend(matrix) {
    const [a1, b1, c1, d1, tx1, ty1] = this.values
    const [a2, b2, c2, d2, tx2, ty2] = matrix.values

    this.a = a2 * a1 + b2 * b1
    this.c = a2 * c1 + b2 * d1
    this.b = c2 * a1 + d2 * b1
    this.d = c2 * c1 + d2 * d1
    this.tx = a2 * tx1 + b2 * ty1 + tx2
    this.ty = c2 * tx1 + d2 * ty1 + ty2

    this._changed()

    return this
  }

  /** @param {Point} point */
  translate({ x, y }) {
    this.tx += x * this.a + y * this.c
    this.ty += x * this.b + y * this.d

    this._changed()

    return this
  }

  /**
   * Matrix이 나타내는 아인 변환을
   * `scaling`과, `rotation` `skewing`으로 해석해서
   * 객체로 반환합니다.
   *
   */
  decompose() {
    const { a, b, c, d } = this
    const det = a * d - b * c
    const { sqrt, atan2 } = Math
    const degrees = 180 / Math.PI

    let rotate = null
    let scale = null
    let skew = null

    if (a !== 0 || b !== 0) {
      const r = sqrt(a * a + b * b)
      rotate = Math.acos(a / r) * (b > 0 ? 1 : -1)
      scale = [r, det / r]
      skew = [atan2(a * c + b * d, r * r), 0]
    } else if (c !== 0 || d !== 0) {
      const s = sqrt(c * c + d * d)
      // rotate = Math.PI/2 - (d > 0 ? Math.acos(-c/s) : -Math.acos(c/s));
      rotate = Math.asin(c / s) * (d > 0 ? 1 : -1)
      scale = [det / s, s]
      skew = [0, atan2(a * c + b * d, s * s)]
    } else {
      // a = b = c = d = 0
      rotate = 0
      skew = scale = [0, 0]
    }
    return {
      translation: this.getTranslation(),
      rotation: rotate * degrees,
      scaling: new Point(...scale),
      skewing: new Point(skew[0] * degrees, skew[1] * degrees),
    }
  }

  getTranslation() {
    return new Point(this.tx, this.ty)
  }

  /**
   *
   * @param {number[]} src
   * @param {number[]} dist
   * @param {number} count
   */
  _transformCoordinates(src, dist, count) {
    for (let i = 0, max = 2 * count; i < max; i += 2) {
      const [x, y] = [src[i], src[i + 1]]
      dist[i] = x * this.a + y * this.c + this.tx
      dist[i + 1] = x * this.b + y * this.d + this.ty
    }
    return dist
  }

  /** @param {Point} point */
  _transformPoint({ x, y }) {
    const tx = x * this.a + y * this.c + this.tx
    const ty = x * this.b + y * this.d + this.ty

    return new Point(tx, ty)
  }

  /** @param {Rectangle} rect */
  _transformCorners(rect) {
    const [x1, y1] = [rect.x, rect.y]
    const [x2, y2] = [x1 + rect.width, y1 + rect.height]
    const coords = [x1, y1, x2, y1, x2, y2, x1, y2]
    return this._transformCoordinates(coords, coords, 4)
  }

  /** @param {Rectangle} bounds */
  _transformBounds(bounds) {
    const coords = this._transformCorners(bounds)
    const min = coords.slice(0, 2)
    const max = min.slice()

    for (let i = 2; i < 8; i++) {
      const val = coords[i]
      const j = i & 1
      if (val < min[j]) min[j] = val
      else if (val > max[j]) max[j] = val
    }

    const [x, y] = min
    const [w, h] = [max[0] - x, max[1] - y]

    return new Rectangle(x, y, w, h)
  }

  /** @param {Point} point */
  _inverseTransform(point) {
    const { a, b, c, d, tx, ty } = this
    const det = a * d - b * c

    const [x, y] = [point.x - tx, point.y - ty]

    return new Point((x * d - y * c) / det, (y * a - x * b) / det)
  }

  /**
   * 행렬의 역행렬을 구합니다.
   * 행렬이 특이행렬(불가역)인 경우 `null`을 반환합니다.
   *
   * @return {Matrix} this matrix, or `null`, if the matrix is singular.
   */
  invert() {
    // if (this.isSingular) return null

    const { a, b, c, d, tx, ty } = this
    const det = a * d - b * c

    this.a = d / det
    this.b = -b / det
    this.c = -c / det
    this.d = a / det
    this.tx = (c * ty - d * tx) / det
    this.ty = (b * tx - a * ty) / det

    return this
  }

  inverted() {
    return this.clone().invert()
  }
}
