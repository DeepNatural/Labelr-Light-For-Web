import { Item } from '../item'

/**
 * @typedef HitOpitons
 * @property {number} tolerance
 * @property {boolean} segment
 * @property {boolean} stroke
 * @property {boolean} video
 */

export class HitResult {
  /**
   *
   * @param {'segment' | 'stroke' | 'fill' | 'bounds'} type
   * @param {Item} item
   * @param  {object} values
   */
  constructor(type, item, values) {
    this.type = type
    this.item = item

    if (values)
      Object.entries(values).forEach(([key, val]) => (this[key] = val))
  }
}
