import { Event } from './event'

export class KeyEvent extends Event {
  /**
   * @typedef KeyEventParam
   * @property {string} type
   * @property {KeyboardEvent} event
   *
   * @param {KeyEventParam} param0
   */
  constructor({ type, event } = {}) {
    super(event)

    this.type = type

    this.key = event.key.toLowerCase()
  }
}
