export class Emitter {
  /** @type {Record<string, Function[]>} */
  _handlers = {}

  /**
   * @param {string} type
   * @param {Function} func
   */
  on(type, func) {
    const handlers = this._handlers[type]

    const noHandler = handlers.indexOf(func) === -1
    if (noHandler) handlers.push(func)

    return this
  }

  /**
   * @param {string} type
   * @param {Function} func
   */
  off(type, func) {
    const handers = this._handlers[type]

    this._handlers[type] = handers.filter((fn) => fn !== func)
  }

  /**
   * @param {string} type
   * @param {Function} func
   */
  once(type, func) {
    return this.on(type, function handler() {
      func.apply(this, arguments)
      this.off(type, handler)
    })
  }

  /**
   * @param {string} type
   * @param {object} event
   */
  emit(type, event) {
    this._handlers[type]?.forEach((func) => func(event))
  }

  constructor() {}
}
