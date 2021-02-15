import { Path } from './path'
import { Point, Matrix } from '../basic'
import { paper } from '..'

export class Segment {
  _class = 'Segment'

  /** @type {Point} */
  point = null

  /** @type {Path} */
  path = null

  index = -1

  get x() {
    return this.point.x
  }

  set x(x) {
    this.point.x = x
  }

  get y() {
    return this.point.y
  }

  set y(y) {
    this.point.y = y
  }

  get isFirst() {
    return this.index === 0
  }

  /**
   * @param {[Point] | [number, number]} args
   */
  constructor(...args) {
    if (args[0] instanceof Point) this.point = args[0]
    else this.point = new Point(args[0], args[1])
  }

  /**
   * Path가 `selected`일 때 보이는 관절 동그라미 그리기
   * 
   * @param {CanvasRenderingContext2D} ctx
   */
  drawHandle(ctx) {
    const fillColor = this.path.style.handleFillColor
    const radius = paper.settings.handleSize

    ctx.save()
    ctx.beginPath()
    ctx.fillStyle = fillColor
    ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  /**
   * 핸들의 인덱스(1부터 시작) 표시
   * 
   * @param {CanvasRenderingContext2D} ctx
   */
  drawHandleIndex(ctx) {
    const fontSize = paper.settings.handleSize * 1.5
    const fontColor = this.path.style.handleIndexFontColor

    ctx.save()
    ctx.font = `${fontSize}px Arial `
    ctx.fillStyle = fontColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.index + 1, this.x, this.y)
    ctx.restore()
  }

  /**
   * @param {Point} point
   * @param {Matrix} pathMatrix
   * @param {number} tolerance
   *
   */
  hitTest(point, pathMatrix, tolerance = 0) {
    const absPoint = this._transformedPoint(pathMatrix)
    if (point.equals(absPoint)) return this

    const distance = Math.hypot(absPoint.x - point.x, absPoint.y - point.y)
    const radius = paper.settings.handleSize + tolerance
    if (distance <= radius) return this

    return null
  }

  /** @param {Matrix} matrix */
  _transformedPoint(matrix) {
    return matrix._transformPoint(this.point)
  }

  remove() {
    return this.path?.removeSegment(this.index)
  }
}
