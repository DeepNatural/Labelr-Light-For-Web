import { Point, Matrix, Rectangle, LinkedRectangle } from '../basic'
import { Style } from '../style'
import { paper } from '..'
import { HitResult } from './hitResult'
import { UID } from '../util/uid'

export class Item {
  _class = 'Item'

  /** @type {Rectangle} */
  _bounds = null

  get bounds() {
    const rect = this._getCachedBounds()

    return new LinkedRectangle(
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      this,
      '_setBounds'
    )
  }

  /** @param {Rectangle} rect */
  set bounds(newBound) {
    this._setBounds(newBound)
  }

  /** 임시 데이터 저장소 */
  data = {}

  get position() {
    return this._getPositionFromBounds()
  }

  /** @param {Point} point*/
  set position(point) {
    this.translate(point.subtract(this.position))
  }

  /** @type {Style} */
  style = null

  /** @type {Item} */
  parent = null

  /** @type {Item[]} */
  children = []

  isEmpty(recursively) {
    const { children } = this
    const numChildren = children.length

    if (recursively) {
      for (const child of children)
        if (!child.isEmpty(recursively)) return false

      return true
    }
    return !numChildren
  }

  _selected = false

  get selected() {
    return this._selected
  }

  set selected(selected) {
    // Group은 자식 Item도 selected를 설정해야함
    if (this._selectChildren)
      for (const item of this.children) item.selected = selected

    if (selected === this._selected) return
    this._selected = selected
    this._project?._updateSelection(this)
  }

  get id() {
    return this._id
  }

  _selectChildren = false

  visible = true

  /** `true` 시 마우스 상호작용을 막음(`hitTest` 불가) */
  locked = false

  /** 핸들 인덱스를 보여줄 지 여부 */
  showHandleIndex = false

  get context() {
    return paper.project.context
  }

  constructor() {
    this._id = UID.get()
    this.style = new Style()
    this._matrix = new Matrix()

    /** @type {import('../item').Project} */
    this._project = paper.project

    if (!this._project) return

    const layer = this._project.activeLayer
    if (!layer) return

    layer.addChild(this)
  }

  /**
   * @param {"muosedown" | "mousedrag" | "mousemove"| "mouseup" | "keydown" | "keyup"} event
   * @param {Function} handler
   */
  on(event, handler) {
    throw new Error('Not Implemented')
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (!this.visible) return

    ctx.save()

    this._matrix.applyToContext(ctx)

    this._setStyle(ctx)

    this._draw(ctx)

    ctx.restore()
  }

  /**
   * 선택된 Item의 핸들을 그립니다.
   * @param {CanvasRenderingContext2D} ctx
   */
  drawHandle(ctx) {
    if (!this.visible) return

    ctx.save()

    this._matrix.applyToContext(ctx)

    this._setStyle(ctx)

    this._drawHandle(ctx)

    ctx.restore()
  }

  /** @param {CanvasRenderingContext2D} ctx */
  _draw(ctx) {
    throw new Error('_draw not implemented!')
  }

  /** @param {CanvasRenderingContext2D} ctx */
  _drawHandle(ctx) {
    throw new Error('_drawHandle not implemented!')
  }

  /** @param {CanvasRenderingContext2D} ctx */
  _setStyle(ctx) {
    const { style } = this
    const {
      strokeColor,
      strokeWidth,
      strokeJoin,
      strokeCap,
      miterLimit,
      fillColor,
      fillRule,
      dashArray,
    } = style

    ctx.strokeStyle = strokeColor.toString()
    ctx.lineWidth = strokeWidth
    if (strokeJoin) ctx.lineJoin = strokeJoin
    if (strokeCap) ctx.lineCap = strokeCap
    if (miterLimit) ctx.miterLimit = miterLimit
    if (fillColor) ctx.fillStyle = fillColor.toString()
    if (dashArray) ctx.setLineDash(dashArray)
  }

  /**
   * @param {Item} item
   */
  addChild(item) {
    item.remove()
    item.parent = this
    this.insertChild(item)
  }

  /**
   * @param {Item} item
   * @param {number} index
   */
  insertChild(item, index) {
    this.insertChildren([item], index)
  }

  /**
   *
   * @param {Item[]} items
   * @param {number} index
   */
  insertChildren(items, index) {
    this.children.splice(index ?? this.children.length, 0, ...items)
  }

  /** @param {Matrix} matrix */
  transform(matrix) {
    // TODO recursively apply the matrix to children
    if (this._matrix.isIdentity && matrix?.isIdentity) return this

    this._matrix.prepend(matrix)

    return this
  }

  /** @param {Point} point*/
  translate(point) {
    return this.transform(new Matrix().translate(point))
  }

  _getPositionFromBounds() {
    return this.bounds.center
  }

  /**
   * @param {Matrix} matrix
   *
   * @return {Rectangle}
   */
  _getCachedBounds(matrix) {
    // TODO Cache Bounds
    this._bounds = this._getBounds(matrix || this._matrix)

    return this._bounds
  }

  /**
   * 기본 Bounds 가져오기
   * Item을 상속받는 항목들은 이 메서드를 재정의해야함
   * @param {Matrix} matrix
   *
   * @return {Rectangle}
   */
  _getBounds(matrix) {
    const { children } = this
    if (!children.length) return new Rectangle()

    return Item._getBounds(children, matrix)
  }

  /**
   *
   * @param {Item[]} items
   * @param {Matrix} matrix
   *
   * @return {Rectangle}
   */
  static _getBounds(items, matrix) {
    let [x1, y1, x2, y2] = [Infinity, Infinity, -Infinity, -Infinity]

    for (const item of items) {
      if (!item.visible || item.isEmpty(true)) continue

      const rect = item._getCachedBounds(
        matrix && matrix.appended(item._matrix)
      )

      x1 = Math.min(rect.x, x1)
      y1 = Math.min(rect.y, y1)
      x2 = Math.max(rect.x + rect.width, x2)
      y2 = Math.max(rect.y + rect.height, y2)
    }

    return Number.isFinite(x1)
      ? new Rectangle(new Point(x1, y1), new Point(x2, y2))
      : new Rectangle()
  }

  /** @param {Rectangle} rect */
  _setBounds(newBound) {
    const newCenter = newBound.center
    const matrix = new Matrix()
    const oldBound = this._getBounds(this._matrix)

    matrix.translate(newCenter)

    if (!newBound.equals(oldBound)) {
      const scale = new Point(
        oldBound.width !== 0 ? newBound.width / oldBound.width : 0,
        oldBound.height !== 0 ? newBound.height / oldBound.height : 0
      )
      matrix.scale(scale)
    }

    const oldCenter = this._getBounds(this._matrix).center
    matrix.translate(oldCenter.negate())

    this.transform(matrix)
  }

  /** @type {function(import('..').MouseEvent): void | null} */
  onMouseDown = null
  /** @type {function(import('..').MouseEvent): void | null} */
  onMouseDrag = null
  /** @type {function(import('..').MouseEvent): void | null} */
  onMouseUp = null
  /** @type {function(import('..').MouseEvent): void | null} */
  onClick = null
  /** @type {function(import('..').MouseEvent): void | null} */
  onMouseMove = null
  /** @type {function(import('..').MouseEvent): void | null} */
  onMouseEnter = null
  /** @type {function(import('..').MouseEvent): void | null} */
  onMouseLeave = null
  /** @type {function(import('..').MouseEvent): void | null} */
  onContextMenu = null

  /**
   * @param {Point} point
   * @param {import('./hitResult').HitOpitons} options
   * @return {HitResult}
   */
  hitTest(point, options) {
    if (this.locked || !this.visible) return null

    return this._hitTest(point, options)
  }

  /**
   * @param {Point} point
   * @param {import('./hitResult').HitOpitons} options
   * @return {HitResult}
   */
  _hitTest(point, options) {
    throw new Error('hitTest not implemented')
  }

  remove() {
    const parent = this.parent
    const index = parent?.children.indexOf(this)
    if (index !== -1) parent?.children.splice(index, 1)
    this.parent = null
    this.children.forEach(item => item.remove())
    this.selected && (this.selected = false)
  }

  removeChildren() {
    this.children.forEach(child => child.remove())
    this.children = []
  }

  clear() {
    this.removeChildren()
  }
}
