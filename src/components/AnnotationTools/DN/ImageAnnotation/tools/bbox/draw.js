import paper, { Rectangular, Color, Tool, Point } from '@/utils/Paper'
import { drawBBox, updateBBox, updateCrossline } from './utils'

export class BBoxDrawTool extends Tool {
  /** @type {Rectangular | null} */
  bbox = null
  bboxColor = Color.random()
  /** @type {Group | null} */
  crossline = null

  /**
   * @param {import("../../model").AnnotationSpec} annotationSpec
   */
  constructor(annotationSpec) {
    super()
    this.spec = annotationSpec
    this.onDrawHandler = null
    paper.view.cursor = 'crosshair'
    this.useCrossline = this.spec?.crossline || true
  }

  activate() {
    this.active = true
    paper.project.activeLayer.selected = false
    paper.view.cursor = 'crosshair'

    this.drawCrossline(paper.view.currentMousePoint)
  }

  deactivate() {
    this.active = false
    paper.view.cursor = 'default'
    this.crossline?.remove()
    this.crossline = null
  }

  /** @param {import('@/utils/Paper').MouseEvent} param0 */
  onMouseDown = ({ downPoint, point }) => {
    paper.project.activeLayer.selected = false

    this.bbox?.remove()

    this.bboxColor = this.spec.color
    this.bbox = drawBBox(downPoint, point, this.bboxColor)
    this.bbox.style.strokeWidth = this.spec.strokeWidth
  }

  /** @param {import('@/utils/Paper').MouseEvent} param0 */
  onMouseDrag = ({ downPoint, point }) => {
    this.bbox = updateBBox(this.bbox, downPoint, point, this.bboxColor)
  }

  /** @param {import('@/utils/Paper').MouseEvent} param0 */
  onMouseUp = ({ downPoint, point }) => {
    this.bbox = updateBBox(this.bbox, downPoint, point, this.bboxColor)

    const bounds = this.bbox.bounds
    if (
      bounds.height < (this.spec.minHeight || 10) ||
      bounds.width < (this.spec.minWidth || 10)
    ) {
      this.bbox.remove()
      this.bbox = null
    }

    if (this.bbox) this.onDrawHandler?.(this.bbox)

    this.bbox = null
  }

  /** @param {import('@/utils/Paper').MouseEvent} param0 */
  onMouseMove = ({ point }) => {
    this.drawCrossline(point)
  }

  /** @param {Point} point */
  drawCrossline(point) {
    if (!this.useCrossline) return

    const style = this.spec.crosslineStyle || {}
    const crossline = this.crossline
    this.crossline = updateCrossline({ crossline, point, style })
  }

  setOnDrawHandler(handler) {
    this.onDrawHandler = handler
  }
}
