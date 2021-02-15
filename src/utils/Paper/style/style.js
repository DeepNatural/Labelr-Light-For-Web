import { Color } from '../style'
import { Point } from '../basic'

export class Style {
  /** @type {Color | null} */
  fillColor = null

  fillRule = 'nonzero'

  /**
   * @type {Color | null}
   */
  strokeColor = null

  strokeWidth = 1

  strokeCap = 'butt'

  /** @type {'miter' | 'round' | 'bevel'} */
  strokeJoin = 'miter'

  strokeScaling = true

  miterLimit = 10

  dashOffset = 0

  /** @type {[number, number] | null} */
  dashArray = null

  /**
   * @type {Color | null}
   */
  shadowColor = null

  shadowBlur = 0

  shadowOffset = new Point()

  /** @type {Color | null} */
  selectedColor = null

  /** @type {Color | null} */
  handleFillColor = null

  /** @type {Color | null} */
  handleIndexFontColor = null

  constructor({
    strokeColor = new Color(0, 0, 0),
    shadowColor = new Color(0, 0, 0),
    handleFillColor = new Color(255, 255, 255),
  } = {}) {
    this.strokeColor = strokeColor
    this.shadowColor = shadowColor
    this.handleFillColor = handleFillColor
  }
}
