import paper, {
  Color,
  Tool,
  Segment,
  Point,
  Path,
  MouseEvent,
  KeyEvent,
} from '@/utils/Paper'

const hitOptions = {
  segment: true,
  stroke: true,
  tolerance: 5,
}

/**
 * 기본 핸들 인덱스 폰트 색상인, Stroke Color에서 투명도 0.6인 Color 반환
 *
 * @param {string} color
 */
export const defaultHandleFontColor = color => {
  const handleFontColor = new Color(color)
  handleFontColor.alpha = 0.6
  return handleFontColor.toString()
}

/**
 * 스펙에 따라 새로운 폴리라인을 생성합니다.
 *
 * @param {{ spec: import('./model').AnnotationSpec, points: Point[] }} param0
 */
export const createPolyline = ({ spec, points }) => {
  const newPolyline = new Path(points.map(({ x, y }) => new Segment(x, y)))
  newPolyline.style.strokeWidth = spec.strokeWidth || 3
  newPolyline.style.strokeColor = new Color(spec.color)
  newPolyline.style.fillColor = new Color('#fff')
  newPolyline.style.handleFillColor = new Color(
    spec.handleFillColor || 'rgba(255, 255, 255, 0.3)'
  )
  newPolyline.style.handleIndexFontColor = new Color(
    spec.handleFontColor || defaultHandleFontColor(spec.color)
  )
  newPolyline.showHandleIndex = true
  newPolyline.data.spec = spec
  return newPolyline
}

export class PolylineDrawTool extends Tool {
  /** @type {Path | null} */
  selectedPath = null
  /** @type {Segment | null} */
  selectedSegment = null
  /** @type {Segment | null} */
  hoveredSegment = null

  /**
   *
   * @param {import("../../model").AnnotationSpec)} annotationSpec
   */
  constructor(annotationSpec) {
    super()
    this.spec = annotationSpec
    this.onDrawHandler = null
    this.currentPathLength = 0
  }

  /**
   * `this.selectedPath.length`에 observable이 붙지 않아서
   * 폴리라인에 변화가 있을 때마다 직접 포인트 개수를 세야
   * 툴바에 포인트를 몇 개째 그리고 있는지 알려줄 수 있음
   */
  setCurrentPathLength() {
    this.currentPathLength = this.selectedPath?.length || 0
  }

  activate() {
    this.active = true
    paper.project.activeLayer.selected = false
    this.selectedPath && (this.selectedPath.selected = true)
    paper.view.cursor = 'crosshair'
  }

  deactivate() {
    this.active = false
    paper.view.cursor = 'default'
  }

  setOnDrawHandler(handler) {
    this.onDrawHandler = handler
  }

  /** @param {MouseEvent} param0 */
  onMouseDown = ({ point }) => {
    if (!this.selectedPath) return this.createNewPath(point)

    if (this.hoveredSegment) {
      this.selectedSegment = this.hoveredSegment
      this.setCurrentPathLength()
      return (this.hoveredSegment = null)
    }

    const hitResult = paper.project.hitTest(point, hitOptions)

    if (!hitResult) return this.addSegmentToPath(point)

    const item = hitResult?.item

    if (item instanceof Segment && item.path === this.selectedPath)
      return (this.selectedSegment = item)

    this.addSegmentToPath(point)
  }

  /** @param {MouseEvent} event */
  onMouseDrag = ({ delta }) => {
    const { selectedSegment, selectedPath } = this

    if (selectedSegment)
      selectedSegment.point = selectedSegment.point.add(delta)
    else if (selectedPath && selectedPath.length >= this.spec.length)
      selectedPath.position = selectedPath.position.add(delta)
  }

  /**
   * 선택된 `Path`가 없으면 새 `Path`를 생성합니다.
   * @param {Point} point
   */
  createNewPath(point) {
    paper.project.activeLayer.selected = false

    this.selectedPath = createPolyline({ spec: this.spec, points: [point] })
    this.selectedPath.selected = true

    this.setCurrentPathLength()
  }

  deletePath() {
    this.selectedPath?.removeSegments()
    this.setCurrentPathLength()
  }

  /**
   * `Path`에 세그먼트를 추가합니다.
   * @param {Point} point
   */
  addSegmentToPath(point, index) {
    const relativePoint = this.selectedPath._matrix._inverseTransform(point)
    this.selectedPath.add([new Segment(relativePoint)], index)
    this.setCurrentPathLength()
  }

  onMouseMove = event => {
    /**
     * 스트로크에 마우스를 올리면 추가할 수 있는 세그먼트를 보여줍니다.
     */
    if (this.hoveredSegment) {
      this.hoveredSegment.remove()
      this.hoveredSegment = null
    }

    const hitResult = paper.project.hitTest(event.point, hitOptions)

    if (!hitResult) return

    if (hitResult.type === 'stroke' && hitResult.item === this.selectedPath) {
      const path = hitResult.item

      if (path.length >= this.spec.length) return

      const point = path._matrix._inverseTransform(event.point)
      this.hoveredSegment = new Segment(point)
      path.add([this.hoveredSegment], hitResult.location + 1)
    }
  }

  /** @param {MouseEvent} event */
  onMouseUp = event => {
    if (this.selectedPath?.length >= this.spec.length) {
      this.onDrawHandler?.(this.selectedPath)
      this.selectedPath = this.selectedSegment = null
      this.setCurrentPathLength()
    }
  }

  /** @param {KeyEvent} event */
  onKeyDown = event => {
    const key = event.key.toLowerCase()

    if (key === 'delete' || key === 'backspace') {
      event.preventDefault()
      return this.deletePath()
    }
  }
}
