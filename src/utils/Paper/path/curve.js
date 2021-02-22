import { Point } from '../basic'
import { Path } from './path'

export class Curve {
  /** @type {Path} */
  path = null

  /**
   * @param {Point} point1
   * @param {Point} point2
   */
  constructor(point1, point2) {
    this.point1 = point1
    this.point2 = point2
  }
}
