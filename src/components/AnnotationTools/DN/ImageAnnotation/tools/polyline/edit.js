import paper, {
  Tool,
  Segment,
  Path,
  MouseEvent,
  Rectangular,
} from '@/utils/Paper'

const hitOptions = {
  segment: true,
  stroke: true,
  tolerance: 5,
}

export class PolylineEditTool extends Tool {
  /** @type {Path | null} */
  selectedPath = null
  /** @type {Segment | null} */
  selectedSegment = null
  onEditHandler = null

  setOnEditHandler(handler) {
    this.onEditHandler = handler
  }

  /** @param {MouseEvent} event */
  onMouseDown = event => {
    paper.project.activeLayer.selected = false
    const hitResult = paper.project.hitTest(event.point, hitOptions)

    if (!hitResult) return

    this.selectedPath = this.selectedSegment = null

    const item = hitResult.item

    if (item instanceof Rectangular || item?.path instanceof Rectangular) return

    if (item instanceof Path) {
      this.selectedPath = item
      this.selectedPath.selected = true
    } else if (item instanceof Segment) {
      this.selectedSegment = item
      this.selectedPath = item.path
      this.selectedPath.selected = true
    }

    paper.view.cursor = 'grabbing'
  }

  /** @param {MouseEvent} event */
  onMouseDrag = ({ delta, downPoint, point }) => {
    const { selectedSegment, selectedPath } = this

    if (selectedSegment)
      selectedSegment.point = selectedSegment.point.add(delta)
    else if (selectedPath)
      selectedPath.position = selectedPath.position.add(delta)
    else paper.view.center = paper.view.center.add(downPoint.subtract(point))
  }

  /** @param {MouseEvent} event */
  onMouseUp = event => {
    if (this.selectedPath) this.onEditHandler?.(this.selectedPath)

    this.selectedPath = this.selectedSegment = null

    paper.view.cursor = 'default'
  }
}
