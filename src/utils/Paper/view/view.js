import { Size, Point, Matrix, Rectangle } from '../basic'
import { Project } from '../item'
import { Emitter } from '../core'
import { KeyEvent, MouseEvent } from '../event'

const eventToHandler = {
  mousedown: 'onMouseDown',
  mouseup: 'onMouseUp',
  click: 'onClick',
  mousedrag: 'onMouseDrag',
  mousemove: 'onMouseMove',
  mouseenter: 'onMouseEnter',
  mouseleave: 'onMouseLeave',
  keydown: 'onKeyDown',
  keypress: 'onKeyPress',
  keyup: 'onKeyUp',
  contextmenu: 'onContextMenu',
}

export class View extends Emitter {
  get size() {
    return this._size
  }

  /** @param {Size} size */
  set size(size) {
    const delta = size.subtract(this._size)

    if (delta.isZero) return

    this._size = size
    this.setElementSize(size)
    this.emit('resize', { size })
  }

  get zoom() {
    const { scaling } = this._matrix.decompose()

    return (scaling.x + scaling.y) / 2
  }

  set zoom(zoom) {
    const scale = zoom / this.zoom
    const scaleVector = new Point(scale, scale)
    this.transform(new Matrix().scale(scaleVector, this.center))
  }

  get center() {
    return this.getBounds().center
  }

  set center(point) {
    this.translate(this.center.subtract(point))
  }

  get cursor() {
    return this._element.style.cursor
  }

  set cursor(cursor) {
    this._element.style.cursor = cursor
  }

  get element() {
    return this._element
  }

  /** @type {Rectangle} */
  _bounds = null

  currentMousePoint = new Point(0, 0)

  /**
   *
   * @param {Project} project
   * @param {HTMLCanvasElement} canvas
   */
  constructor(project, canvas) {
    super()

    this._element = canvas
    this._element.tabIndex = 1

    this._project = project

    this._context = canvas.getContext('2d')

    this._matrix = new Matrix()
    this._matrix._owner = this

    this._size = this.canvasSize

    this.setElementSize(this._size)

    window.addEventListener('resize', this.resize.bind(this))

    this.resizeObserver = new ResizeObserver(() =>
      setTimeout(() => this.resize())
    )

    this.resizeObserver.observe(this._element)

    this._setupEvent()

    this._animate = true
  }

  remove() {
    this.stop()
    window.removeEventListener('resize', this.resize)
    this.resizeObserver?.disconnect()
    this._element = null
    if (this._project._view) this._project._view = null
    this._project = null
  }

  get canvasSize() {
    const canvas = this.element

    if (!canvas) return new Size()

    return new Size(canvas.offsetWidth, canvas.offsetHeight)
  }

  resize() {
    this.size = this.canvasSize
  }

  /**
   * `_matrix` 변화 시 알람을 받는 메서드.
   *
   * bounds를 다시 계산하기 위해 `_bounds`를 초기화함
   */
  _changed() {
    this._bounds = null
  }

  play() {
    this._animate = true
    this.requestUpdate()
  }

  stop() {
    this._animate = false
  }

  requestUpdate() {
    requestAnimationFrame(() => {
      if (!this._animate) return
      this.update()
      this.requestUpdate()
    })
  }

  /** @param {Size} size */
  setElementSize(size) {
    if (!this._element) return
    if (this._element.width !== size.width) this._element.width = size.width
    if (this._element.height !== size.height) this._element.height = size.height
  }

  update() {
    const project = this._project
    const ctx = this._context
    const size = this._size

    ctx.clearRect(0, 0, size.width + 1, size.height + 1)

    project.draw(ctx, this._matrix)
  }

  _setupEvent() {
    this._setupMouseEvent()
    this._setupWheelEvent()
    this._setupKeyEvent()
  }

  _setupMouseEvent() {
    const view = this
    const element = this._element

    let dragging = false
    /** @type {Point}*/
    let downPoint = null
    /** @type {Point}*/
    let prevPoint = null

    /**
     * @param {string} type
     * @param {globalThis.MouseEvent} event
     */
    const handleMouseEvent = (type, event) => {
      const point = this.getEventPoint(event)
      const delta = prevPoint ? point.subtract(prevPoint) : null
      const hitResult = view._project.hitTest(point)
      const hitItem = hitResult?.item

      if (type === 'mousedown') (downPoint = point), (dragging = true)

      const mouseEvent = new MouseEvent({
        type,
        event,
        point,
        target: hitItem,
        delta,
        hitResult,
        downPoint,
      })

      prevPoint = point

      if (type === 'mouseup') (downPoint = null), (dragging = false)
      if (dragging && type === 'mousemove') hitItem?.onMouseDrag?.(mouseEvent)
      if (hitItem) hitItem?.[eventToHandler[type]]?.(mouseEvent)

      paper.tools.forEach(tool => {
        if (!tool.active) return

        if (dragging && type === 'mousemove') tool?.onMouseDrag?.(mouseEvent)
        tool?.[eventToHandler[type]]?.(mouseEvent)
      })

      this.emit(type, mouseEvent)
      this.currentMousePoint = point
    }

    ;['mousedown', 'mousemove', 'mouseup', 'contextmenu'].forEach(type => {
      element.addEventListener(type, event => handleMouseEvent(type, event))
    })
  }

  _setupWheelEvent() {
    const element = this._element

    const ZOOM_FACTOR = 1.1
    const PAN_FACTOR = 100

    /**
     *
     * @param {number} delta
     * @param {Point} point
     */
    function changeZoom(delta, point) {
      const oldZoom = paper.view.zoom
      const center = paper.view.center
      const zoom = delta < 0 ? oldZoom * ZOOM_FACTOR : oldZoom / ZOOM_FACTOR
      const beta = oldZoom / zoom
      const pc = point.subtract(center)
      const offset = point.subtract(pc.multiply(beta)).subtract(center)
      return { zoom, offset }
    }

    /** @param {WheelEvent} e */
    const handleWheelEvent = e => {
      e.preventDefault()

      const view = this

      if (e.ctrlKey || e.metaKey) {
        // Pan up and down
        const delta = new Point(0, PAN_FACTOR * Math.sign(e.deltaY))
        view.center = view.center.add(delta)
      } else if (e.shiftKey) {
        // Pan left and right
        const delta = new Point(PAN_FACTOR * Math.sign(e.deltaY), 0)
        view.center = view.center.add(delta)
      } else {
        const viewPosition = view.viewToProject(new Point(e.offsetX, e.offsetY))
        const transform = changeZoom(e.deltaY, viewPosition)
        if (transform.zoom < 10 && transform.zoom > 0.1) {
          view.zoom = transform.zoom
          view.center = view.center.add(transform.offset)
        }
      }
      return false
    }

    element.addEventListener('wheel', handleWheelEvent)
  }

  _setupKeyEvent() {
    const element = this._element

    const handleKeyEvent = (type, event) => {
      const keyEvent = new KeyEvent({ type, event })

      paper.tools.forEach(
        tool => tool.active && tool?.[eventToHandler[type]]?.(keyEvent)
      )

      this.emit(type, keyEvent)
    }

    ;['keydown', 'keypress', 'keyup'].forEach(type => {
      element.addEventListener(type, event => handleKeyEvent(type, event))
    })
  }

  emitMouseEvent(obj, target, type, event, point, prevPoint, stopItem) {}

  /** @param {Matrix} matrix */
  transform(matrix) {
    this._matrix.append(matrix)
  }

  /** @param {Point} point */
  translate(point) {
    return this.transform(new Matrix().translate(point))
  }

  /** @param {globalThis.MouseEvent} event */
  getEventPoint(event) {
    return this.viewToProject(new Point(event.offsetX, event.offsetY))
  }

  /** @param {Point} point */
  viewToProject(point) {
    return this._matrix._inverseTransform(point)
  }

  getBounds() {
    if (!this._bounds)
      this._bounds = this._matrix
        .inverted()
        ._transformBounds(new Rectangle(new Point(), this._size))

    return this._bounds
  }

  get bounds() {
    return this.getBounds()
  }
}
