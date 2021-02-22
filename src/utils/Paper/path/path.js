import { Item, HitResult } from '../item'
import { Point, Matrix, Rectangle } from '../basic'
import { Segment } from './segment'
import { Curve } from './curve'
import { Rectangular } from '../path'

export class Path extends Item {
  _class = 'Path'

  /** @type {Segment[]} */
  _segments = []

  /** @type {Curve[]} */
  _curves = []

  showSegments = false

  closed = false

  get firstSegment() {
    return this._segments[0]
  }

  get lastSegment() {
    return this._segments[this._segments.length - 1]
  }

  get length() {
    return this._segments.length
  }

  /** @param {Segment[]} segments */
  constructor(segments = [], { closed = false } = {}) {
    super()

    this.position = new Point(0, 0)

    this.add(segments)

    this.closed = closed
  }
  /**
   * @param {Segment[]} segments
   * @param {number} index
   */
  add(segments, index = this._segments.length) {
    this._segments.splice(index, 0, ...segments)

    this._segments.forEach((segment, idx) => {
      segment.path = this
      segment.index = idx
    })
  }

  closePath() {
    this.closed = true
  }

  /** @param {CanvasRenderingContext2D} ctx */
  _draw(ctx) {
    ctx.beginPath()

    this._drawSegments(ctx)

    if (this.showSegments && !this.selected) this._drawHandle(ctx)

    ctx.closePath()
  }

  /** @param {CanvasRenderingContext2D} ctx */
  _drawHandle(ctx) {
    this._segments.forEach(segment => segment.drawHandle(ctx))

    if (this.showHandleIndex) this._drawHandleIndex(ctx)
  }

  /** @param {CanvasRenderingContext2D} ctx */
  _drawHandleIndex(ctx) {
    this._segments.forEach(segment => segment.drawHandleIndex(ctx))
  }

  /** @param {CanvasRenderingContext2D} ctx */
  _drawSegments(ctx) {
    ctx.save()

    this._segments.forEach(({ x, y }, idx) => {
      if (idx === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })

    if (this.closed) {
      ctx.closePath()
      if (this.style.fillColor) ctx.fill()
    }

    ctx.stroke()

    ctx.restore()
  }

  getSegmentPoint(index) {
    return this._segments[index]?._transformedPoint(this._matrix).clone()
  }

  /** @type {Path2D[]} */
  get strokes() {
    const segments = this._segments

    const strokes = Array.from({ length: segments.length }, (_, i) => {
      const path = new Path2D()
      const point1 = segments[i]._transformedPoint(this._matrix)
      const point2 = segments[
        i === segments.length - 1 ? 0 : i + 1
      ]._transformedPoint(this._matrix)

      path.moveTo(point1.x, point1.y)
      path.lineTo(point2.x, point2.y)

      return path
    })

    if (!this.closed) strokes.pop()

    return strokes
  }

  get strokePoints() {
    const segments = this._segments

    const strokePoints = Array.from({ length: segments.length }, (_, i) => {
      const path = new Path2D()
      const point1 = segments[i]._transformedPoint(this._matrix)
      const point2 = segments[
        i === segments.length - 1 ? 0 : i + 1
      ]._transformedPoint(this._matrix)

      return [point1, point2]
    })

    if (!this.closed) strokePoints.pop()

    return strokePoints
  }

  get path2D() {
    const path = new Path2D()

    this._segments.forEach((segment, idx) => {
      const point = segment._transformedPoint(this._matrix)

      if (idx === 0) path.moveTo(point.x, point.y)
      else path.lineTo(point.x, point.y)
    })

    if (this.closed) {
      path.closePath()
    }

    return path
  }

  /**
   * @param {Point} point
   * @param {import('../item').HitOpitons} options
   */
  _hitTest(point, options = {}) {
    // 각 모서리가 맞았는지 확인

    if (options.segment) {
      const segmentHitResult = this._segmentHitTest(point, options)
      if (segmentHitResult) return segmentHitResult
    }

    if (options.stroke) {
      const strokeHitResult = this._strokeHitTest(point, options)
      if (strokeHitResult) return strokeHitResult
    }

    // 내부가 맞았는지 확인
    const fillCollided =
      this.closed && this.context.isPointInPath(this.path2D, point.x, point.y)

    if (fillCollided) return new HitResult('fill', this)

    return null
  }

  /**
   * @param {Point} point
   * @param {import('../item').HitOpitons} options
   */
  _segmentHitTest(point, { tolerance }) {
    const segmentHit = this._segments.find(segment =>
      segment.hitTest(point, this._matrix, tolerance)
    )

    if (segmentHit) return new HitResult('segment', segmentHit)
  }

  /**
   * @param {Point} point
   * @param {import('../item').HitOpitons} options
   */
  _strokeHitTest(point, { tolerance }) {
    let strokeHitIndex = -1

    if (tolerance) {
      const strokeToleranceHit = this.strokePoints.reduce(
        (acc, [lineStart, lineEnd], index) => {
          const closestPoint = point.closestPointInLine(lineStart, lineEnd)
          const distance = point.subtract(closestPoint).length
          const closeEnough = distance < tolerance

          if (closeEnough && distance < acc.distance) {
            acc.index = index
            acc.distance = distance
          }

          return acc
        },
        { index: -1, distance: Infinity }
      )

      strokeHitIndex = strokeToleranceHit.index
    } else {
      strokeHitIndex = this.strokes.findIndex(stroke =>
        this.context.isPointInStroke(stroke, point.x, point.y)
      )
    }

    const strokeCollided = strokeHitIndex !== -1
    if (strokeCollided)
      return new HitResult('stroke', this, { location: strokeHitIndex })
  }

  /** @param {Matrix} matrix */
  _getBounds(matrix) {
    if (!this.firstSegment) return new Rectangle()

    const [xs, ys] = this._segments.reduce(
      (acc, segment) => (acc[0].push(segment.x), acc[1].push(segment.y), acc),
      [[], []]
    )

    const { min, max } = Math
    const coords = [min(...xs), min(...ys), max(...xs), max(...ys)]

    matrix.appended(this._matrix)._transformCoordinates(coords, coords, 2)

    const [x1, y1, x2, y2] = coords

    return new Rectangle(new Point(x1, y1), new Point(x2, y2))
  }

  static get Rectangular() {
    return Rectangular
  }

  /**
   * 주어진 index의 세그먼트를 제거합니다.
   *
   * @param {number} index
   */
  removeSegment(index) {
    return this.removeSegments(index, index + 1)?.[0]
  }

  removeSegments(start = 0, end = this._segments.length) {
    const deletedSegments = this._segments.splice(
      start,
      Math.max(end - start, 0)
    )

    deletedSegments.forEach(segment => {
      segment.path = null
      segment.index = null
    })

    this._segments.forEach((segment, index) => {
      segment.index = index
    })

    return deletedSegments
  }

  export() {
    return this._segments.map(segment =>
      segment._transformedPoint(this._matrix).export()
    )
  }
}
