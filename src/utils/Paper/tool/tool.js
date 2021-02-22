export class Tool {
  constructor() {
    paper.tools.push(this)
    this.active = true
  }

  activate() {
    this.active = true
  }

  deactivate() {
    this.active = false
  }

  /** @type {function(import('..').MouseEvent): void | null} */
  onMouseDown = null

  /** @type {function(import('..').MouseEvent): void | null} */
  onMouseDrag = null

  /** @type {function(import('..').MouseEvent): void | null} */
  onMouseMove = null

  /** @type {function(import('..').MouseEvent): void | null} */
  onMouseUp = null

  /** @type {function(import('..').MouseEvent): void | null} */
  onKeyDown = null

  /** @type {function(import('..').MouseEvent): void | null} */
  onKeyUp = null

  /** @type {function(import('..').MouseEvent): void | null} */
  onContextMenu = null

  remove() {
    const index = paper.tools.indexOf(this)
    if (index !== -1) paper.tools.splice(index, 1)
  }
}
