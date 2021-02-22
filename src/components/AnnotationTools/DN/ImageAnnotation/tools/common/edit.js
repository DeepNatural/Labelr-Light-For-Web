import paper, {
  Tool,
  Path,
  Segment,
  Rectangular,
  Item,
  KeyEvent,
  MouseEvent,
} from '@/utils/Paper'
import { BBoxEditTool } from '../bbox/edit'
import { PolylineEditTool } from '../polyline'

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

/**
 * Item이 BBox인지 확인하는 함수
 *
 * @param {Item} item
 */
const isBBox = item =>
  item?._class === 'Rectangular' || item?.path?._class === 'Rectangular'

/**
 * Item이 Polyline인지 확인하는 함수
 *
 * @param {Item} item
 */
const isPolyline = item =>
  item?._class === 'Path' || item?.path?._class === 'Path'

export class AnnotationEditTool extends Tool {
  /** @type {BBoxEditTooll | PolylineEditTool} */
  tool = null

  /**
   * 아이템 수정이 끝나고 실행되는 콜백
   *
   * @type {Function | null}
   */
  onEditHandler = null

  /**
   * BBox에 오른쪽 마우스가 클릭됐을 때 실행되는 콜백
   *
   * @type {Function | null}
   */
  onBBoxContextMenu = null

  constructor() {
    super()
    this.bboxTool = new BBoxEditTool()
    this.polylineTool = new PolylineEditTool()
    this.bboxTool.deactivate()
    this.polylineTool.deactivate()
  }

  onMouseDown = event => {
    const hitResult = paper.project.hitTest(event.point, hitOptions)
    const item = hitResult?.item
    if (!item) return (paper.project.activeLayer.selected = false)

    this.tool?.deactivate()

    if (item instanceof Segment) {
      this.tool =
        item.path instanceof Rectangular ? this.bboxTool : this.polylineTool
    } else if (item instanceof Rectangular) {
      this.tool = this.bboxTool
    } else if (item instanceof Path) {
      this.tool = this.polylineTool
    }

    this.tool?.activate?.()
    this.tool?.onMouseDown(event)
  }

  onMouseUp = event => {
    this.tool?.onMouseUp?.(event)
    this.tool?.deactivate()
    paper.view.cursor = 'grab'
  }

  /** @param {MouseEvent} event */
  onMouseDrag = ({ delta, downPoint, point }) => {
    const usingBBox = !!this.tool?.bbox
    const usingPolyline = !!this.tool?.selectedPath

    if (usingBBox || usingPolyline) return

    paper.view.center = paper.view.center.add(downPoint.subtract(point))
    paper.view.cursor = 'grabbing'
  }

  onMouseMove = ({ point, downPoint }) => {
    const usingBBox = !!this.tool?.bbox
    const usingPolyline = !!this.tool?.selectedPath

    if (usingBBox || usingPolyline) return

    const hitResult = paper.project.hitTest(point, hitOptions)
    const { item, type, location } = hitResult || {}
    if (!item) return !downPoint && (paper.view.cursor = 'grab')

    if (isBBox(item)) {
      const cursor =
        type === 'stroke'
          ? strokeCursors[location]
          : type === 'segment'
          ? cornerCursors[item.index]
          : type === 'fill'
          ? 'move'
          : 'default'

      return (paper.view.cursor = cursor)
    }

    if (isPolyline(item)) {
      return (paper.view.cursor = 'grab')
    }
  }

  /**
   * 방향키 입력 시 아이템 위치를 옮김
   *
   * @param {KeyEvent} arg0
   */
  onKeyDown = ({ event }) => {
    const shiftFactor = event.shiftKey ? 10 : 1

    if (event.key === 'ArrowRight') {
      this.moveSelectedItem({ x: 1 * shiftFactor, y: 0 })
    } else if (event.key === 'ArrowLeft') {
      this.moveSelectedItem({ x: -1 * shiftFactor, y: 0 })
    } else if (event.key === 'ArrowUp') {
      this.moveSelectedItem({ x: 0, y: -1 * shiftFactor })
    } else if (event.key === 'ArrowDown') {
      this.moveSelectedItem({ x: 0, y: 1 * shiftFactor })
    }
  }

  /** 선택된 `Item`을 x, y 만큼 움직입니다. */
  moveSelectedItem({ x = 0, y = 0 } = {}) {
    const [selectedItem] = paper.project.getItems({ selected: true })
    if (!selectedItem) return

    selectedItem.bounds.x += x
    selectedItem.bounds.y += y
    this?.onEditHandler(selectedItem)
  }

  activate() {
    this.active = true
  }

  deactivate() {
    this.tool?.deactivate()
    this.active = false
  }

  setOnEditHandler(handler) {
    this.onEditHandler = handler
    this.bboxTool.setOnEditHandler(this.onEditHandler)
    this.polylineTool.setOnEditHandler(this.onEditHandler)
  }

  setOnBBoxContextMenu(handler) {
    this.onBBoxContextMenu = handler
  }

  /**
   * BBox에 오른쪽 마우스 클릭 시 이벤트 발생
   * @param {MouseEvent} event
   */
  onContextMenu = event => {
    const hitItem = event?.hitResult?.item

    if (isBBox(hitItem)) {
      event.event.preventDefault()
      this.onBBoxContextMenu?.(hitItem)
    }
  }
}
