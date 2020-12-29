import { upperFirst } from 'lodash'
import
  Tool,
  {
    BoxTool,
    PolygonTool,
    SelectTool,
    MoveTool,
    PointTool
  }
from './tool'
import Subject from './subject'
import Layer from './layer'

export {
  Layer,
  Subject,
  Tool,
  BoxTool,
  PolygonTool,
  SelectTool,
  MoveTool,
  PointTool
}

export class CanvasScale {
  static MAX_SCALE = Math.pow(1/.8, 12)
  static MIN_SCALE = Math.pow(.8, 8)

  #scale = 1
  #scaleMultiplier = .8
  #coord = {
    x: 0,
    y: 0
  }
  /**
   * @type {{ onChangeScale: s: CanvasScale => void }}
   */
  #options = {}

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{ onChangeScale: s: CanvasScale => void }} options
   */
  constructor(canvas, options) {
    this.canvas = canvas
    this.#coord = this.centerCoord
    this.#options = options
  }

  get centerCoord() {
    const { canvas } = this

    if(canvas) {
      const { width, height } = canvas

      return { x: width / 2, y : height / 2 }
    }

    return { x: 0, y: 0 }
  }

  get() {
    return this.#scale
  }

  getCoord() {
    return this.#coord
  }

  on(name, payload) {
    const options = this.#options
    const handler = options[`on${upperFirst(name)}`]

    if(typeof handler === 'function') {
      handler(payload)
    }
  }

  /**
   * @param {number} scale 
   * @param {{ x: number, y: number }} coord
   */
  set(scale, coord) {
    this.#scale = scale
    this.#coord = coord
    this.on('changeScale', this.toJSON())
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} delta
   */
  zoom(x, y, delta) {
    const scale = this.#scale
    const coord = this.#coord
    const nextScale = Math.max(Math.min(scale / Math.pow(this.#scaleMultiplier, delta < 0 ? 1 : -1), CanvasScale.MAX_SCALE), CanvasScale.MIN_SCALE)
    
    const diffByScale = [x - coord.x, y - coord.y].map(v => v / scale)
    const before = [diffByScale[0], diffByScale[1]].map(v => v * scale)
    const after = [diffByScale[0], diffByScale[1]].map(v => v * nextScale)

    this.set(nextScale, {
      x: coord.x + (before[0] - after[0]),
      y: coord.y + (before[1] - after[1])
    })
  }

  restore() {
    this.set(1, this.centerCoord)
  }

  toJSON() {
    const coord = this.#coord
    const scale = this.#scale

    return {
      value: scale,
      ...coord
    }
  }
}
