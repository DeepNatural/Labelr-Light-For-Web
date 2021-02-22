export class Event {
  /**
   *
   * @param {_Event} event
   */
  constructor(event) {
    this.event = event
    this.type = event.type
  }

  getModifiers() {
    const { shiftKey, altKey, ctrlKey, metaKey } = this.event

    return {
      shift: shiftKey,
      alt: altKey,
      ctrl: ctrlKey,
      meta: metaKey,
    }
  }

  preventDefault() {
    this.event.preventDefault()
  }
}
