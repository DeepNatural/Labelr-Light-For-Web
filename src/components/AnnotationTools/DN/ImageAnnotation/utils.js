import { Point, Path, Segment, Color, Rectangular } from '@/utils/Paper'
import { createPolyline } from './tools/polyline/draw'

/**
 *  polyline을 역직렬화하고, 이미 돼있는 경우 polyline을 그대로 반환
 *
 * @param {import('./model').StoredAnnotation} arg0
 */
export const deserializePolyline = ({ type, spec, polyline }) => {
  if (type !== 'polyline') return null

  if (polyline instanceof Path) return polyline

  return createPolyline({ spec, points: polyline })
}

/**
 * bbox를 역직렬화하고, 이미 돼있는 경우 bbox를 그대로 반환
 *
 * @param {import('./model').StoredAnnotation} arg0
 */
export const deserializeBBox = ({ type, spec, bbox }) => {
  if (type !== 'bbox') return null

  if (bbox instanceof Rectangular) return bbox

  const { x, y, width, height } = bbox

  const newBBox = new Rectangular(
    new Point(x, y),
    new Point(x + width, y + height)
  )
  newBBox.style.strokeWidth = spec.strokeWidth || 3
  newBBox.style.strokeColor = new Color(spec.color)
  newBBox.data.spec = spec
  return newBBox
}

/**
 * @param {import('./model').StoredAnnotation} annotation
 *
 * @returns {import('./model').ParsedAnnotation}
 */
export const deserializeAnnotation = annotation => {
  const bbox = deserializeBBox(annotation)
  const polyline = deserializePolyline(annotation)
  const id = (bbox || polyline).id || generateId()

  return { ...annotation, bbox, polyline, id }
}

export const generateId = () => new Date().getTime()

/**
 * 아이템을 화면 크기에 맞게 확대함
 *
 * @param {import('@/utils/Paper').Rectangle} bounds
 */
export function zoomBounds(bounds, zoomPadding = 100) {
  const { min, max } = Math
  const viewSize = paper.view.size
  const center = bounds.center
  const zoom = max(
    min(
      viewSize.width / (bounds.width + zoomPadding),
      viewSize.height / (bounds.height + zoomPadding),
      10
    ),
    0.1
  )
  paper.view.center = center
  paper.view.zoom = zoom
}
