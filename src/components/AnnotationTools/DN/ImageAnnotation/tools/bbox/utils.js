import {
  Point,
  Rectangle,
  Path,
  Segment,
  Group,
  Color,
  Rectangular,
} from '@/utils/Paper'

/**
 * @param {Point} start
 * @param {Point} end
 * @param {string} color
 */
export const drawBBox = (start, end, color) => {
  const bounds = new Rectangle(start, end)
  const bbox = new Rectangular(bounds)
  bbox.style.strokeColor = new Color(color)
  bbox.style.strokeWidth = 3
  return bbox
}

/**
 *
 * @param {Rectangular} bbox
 * @param {Point} start
 * @param {Point} end
 */
export const updateBBox = (bbox, start, end) => {
  const bounds = new Rectangle(start, end)
  bbox.bounds = bounds
  return bbox
}

const ENDPOINT = 100000

/** @param {{ point: Point, style: import('../../model').CrosslineStyle }} param0 */
export const drawCrossline = ({ point: { x, y }, style }) => {
  const horizontalLine = new Path(
    [new Segment(-ENDPOINT, y), new Segment(ENDPOINT, y)],
    { closed: true }
  )
  const verticalLine = new Path(
    [new Segment(x, -ENDPOINT), new Segment(x, ENDPOINT)],
    { closed: true }
  )

  const color = new Color(style?.color || 'rgba(255, 255, 255, 0.8')
  const strokeWidth = style?.strokeWidth || 1

  horizontalLine.style.strokeColor = verticalLine.style.strokeColor = color
  horizontalLine.style.strokeWidth = verticalLine.style.strokeWidth = strokeWidth
  horizontalLine.style.dashArray = verticalLine.style.dashArray =
    style.dashArray

  const crossline = new Group([horizontalLine, verticalLine])
  crossline.locked = true

  return crossline
}

/**
 * @param {{ crossline: Group, point: Point, style: import('../../model').CrosslineStyle }} param0
 */
export const updateCrossline = ({ crossline, point: { x, y }, style }) => {
  if (!crossline) return drawCrossline({ point: { x, y }, style })

  const [horizontalLine, verticalLine] = crossline.children

  horizontalLine._segments[0].point = new Point(-ENDPOINT, y)
  horizontalLine._segments[1].point = new Point(ENDPOINT, y)

  verticalLine._segments[0].point = new Point(x, -ENDPOINT)
  verticalLine._segments[1].point = new Point(x, ENDPOINT)

  return crossline
}
