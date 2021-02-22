import { Event } from './event'
import { Point } from '../basic'
import { Item, HitResult } from '../item'

export class MouseEvent extends Event {
  /**
   * @typedef MouseEventParam
   * @property {string} type
   * @property {_Event} event
   * @property {Point} point
   * @property {Item} target
   * @property {Point} delta
   * @property {Point} downPoint
   * @property {HitResult} hitResult
   *
   * @param {MouseEventParam} param0
   */
  constructor({
    type,
    event,
    point,
    target,
    delta,
    hitResult,
    downPoint,
  } = {}) {
    super(event)

    this.type = type
    this.point = point
    this.target = target
    this.delta = delta
    this.hitResult = hitResult
    this.downPoint = downPoint
  }

  toString() {
    return `{
      type: ${this.type},
      point: ${this.point},
      target: ${this.target}
      ${this.delta ? `, delta: ${this.delta}` : ''},
      modifiers: ${this.getModifiers()} }`
  }
}
