import { Event } from '../event'
import { Tool } from './tool'
import { Item } from '../item'
import { Point } from '../basic'

export class ToolEvent extends Event {
  /** @type {Item} */
  item = null

  /** @type {Point} */
  point = null

  /** @type {Point} */
  lastPoint = null

  /** @type {Point} */
  delta = null

  /**
   *
   * @param {Tool} tool
   * @param {string} type
   * @param {Event} event
   */
  constructor(tool, type, event) {
    this.tool = tool
    this.type = type
    this.event = event
  }
}
