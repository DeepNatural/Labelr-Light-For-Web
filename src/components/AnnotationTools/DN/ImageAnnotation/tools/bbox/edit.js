import paper, { Rectangle, Rectangular, Tool } from '@/utils/Paper'

const hitOptions = {
  segment: true,
  stroke: true,
  tolerance: 5,
}

const strokeCursors = ['ns-resize', 'ew-resize', 'ns-resize', 'ew-resize']
const cornerCursors = [
  'nwse-resize',
  'nesw-resize',
  'nwse-resize',
  'nesw-resize',
]
export class BBoxEditTool extends Tool {
  /** @type {Rectangular | null} */
  bbox = null

  onEditHandler = null

  setOnEditHandler(handler) {
    this.onEditHandler = handler
  }

  onMouseDown = event => {
    paper.project.activeLayer.selected = false

    const hitResult = paper.project.hitTest(event.point, hitOptions)
    if (!hitResult) return

    const { item, type, location } = hitResult

    if (!(item instanceof Rectangular || item?.path instanceof Rectangular))
      return

    if (type === 'stroke') {
      this.bbox = item
      this.bbox.selected = true
      this.bbox.data.state = 'side-resizing'
      this.bbox.data.prevBounds = this.bbox.bounds.clone()
      this.bbox.data.location = location
      paper.view.cursor = strokeCursors[location]
    } else if (type === 'fill') {
      this.bbox = item
      this.bbox.selected = true
      this.bbox.data.state = 'moving'
    } else if (type === 'segment') {
      /** @type {Segment} */
      const segment = item
      const index = segment.index
      const opposite = (index + 2) % 4

      this.bbox = item.path
      this.bbox.selected = true
      this.bbox.data.state = 'full-resizing'
      this.bbox.data.prevBounds = this.bbox.bounds.clone()
      this.bbox.data.from = this.bbox.getSegmentPoint(opposite)

      paper.view.cursor = cornerCursors[index]
    }
  }

  /** @param {import('@/utils/Paper').MouseEvent} event */
  onMouseDrag = event => {
    const { bbox } = this

    if (!bbox) return

    if (bbox.data.state === 'moving') {
      bbox.position = bbox.position.add(event.delta)
    } else if (bbox.data.state === 'side-resizing') {
      const bounds = bbox.bounds.clone()
      const location = bbox.data.location

      if (location === 0) {
        bounds.y += event.delta.y
        bounds.height -= event.delta.y
      } else if (location === 2) {
        bounds.height += event.delta.y
      } else if (location === 1) {
        bounds.width += event.delta.x
      } else if (location === 3) {
        bounds.x += event.delta.x
        bounds.width -= event.delta.x
      }

      bbox.bounds = bounds
    } else if (bbox.data.state === 'full-resizing') {
      const bounds = new Rectangle(bbox.data.from, event.point)
      bbox.bounds = bounds
    }
  }

  onMouseUp = () => {
    if (this.bbox) this.onEditHandler?.(this.bbox)
    this.bbox = null
    paper.view.cursor = 'default'
  }
}
