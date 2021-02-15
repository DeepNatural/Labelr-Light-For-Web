import { Layer } from './layer'
import { View } from '../view'
import { Matrix } from '../basic'

export class Project {
  _class = 'Project'

  /** @type {Layer} */
  activeLayer = null

  /** @type {Layer[]} */
  layers = []

  get context() {
    return this._view._context
  }

  get view() {
    return this._view
  }

  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this._view = new View(this, canvas)
    const layer = new Layer([])
    this.activeLayer = layer
    this.layers.push(layer)
    this._selectedItems = {}
    this._selectionCount = 0
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {Matrix} matrix
   */
  draw(ctx, matrix) {
    ctx.save()

    matrix.applyToContext(ctx)

    this.activeLayer.draw(ctx)

    this.activeLayer.drawHandle(ctx)

    ctx.restore()
  }

  /**
   * @param {Point} point
   * @param {import('./hitResult').HitOpitons} options
   */
  hitTest(point, options) {
    return this.activeLayer.hitTest(point, options)
  }

  get selectedItems() {
    return Object.values(this._selectedItems)
  }

  /**
   * 선택된 Item을 `selectionItems`에 저장합니다.
   * @param {import('../item').Item} item
   */
  _updateSelection(item) {
    const id = item._id
    const selectedItems = this._selectedItems

    if (item._selected) {
      if (selectedItems[id] !== item) {
        this._selectionCount++
        selectedItems[id] = item
      }
    } else if (selectedItems[id] === item) {
      this._selectionCount--
      delete selectedItems[id]
    }
  }

  /**
   *
   * @returns {import('../item').Item[]}
   */
  getItems({ selected } = {}) {
    if (selected) return Object.values(this._selectedItems)

    return this.activeLayer.children
  }

  remove() {
    this.view.remove()
    this.layers.forEach(layer => layer.remove())
  }
}
