import { HitResult } from './hitResult'
import { Item } from './item'

export class Group extends Item {
  _class = 'Group'

  /** @param {Item[]} children */
  constructor(children) {
    super()

    this._selectChildren = true

    children.forEach(item => {
      // layer에서 제거하고 자신의 자식으로 추가함
      item.remove()
      this.addChild(item)
    })
  }

  /**
   * @param {Point} point
   * @param {import('./hitResult').HitOpitons} options
   */
  _hitTest(point, options) {
    // 나중에 등록된 아이템일수록 위쪽으로 렌더링됨
    // 위에서부터 아이템을 탐지하기 위해 루프를 거꾸로 돎
    for (let i = this.children.length - 1; i >= 0; i--) {
      const hitResult = this.children[i].hitTest(point, options)
      if (hitResult) return hitResult
    }
  }

  /** @param {CanvasRenderingContext2D} ctx */
  _draw(ctx) {
    this.children.forEach(item => item.draw(ctx))
  }

  /** @param {CanvasRenderingContext2D} ctx */
  _drawHandle(ctx) {
    this.children.forEach(item => item.selected && item.drawHandle(ctx))
  }
}
