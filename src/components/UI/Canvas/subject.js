import { RGBA } from '@/utils'
import Tool, { PointTool, PolygonTool } from './tool'

/**
 * @class
 */
export default class Subject {
  toolType = ''

  meta = {}

  /**
   * @type {number[][]} 
   * Subject 를 이루는 좌표
   */
  _points = []

  /**
   * @type {number[]} 
   * 포인트가 추가 될 것으로 보이는 예상 좌표
   */
  expectedPoint = []

  /**
   * @type {{ src: HTMLImageElement, width: number, height: number, x: number, y: number, scale: number }}
   * `toolType` 이 `'Image'` 일 경우에만 쓰임
   */
  #img = {}

  /** `path` 와 `point` 스타일 */
  #style = {
    path: {
      lineWidth: 1,
      fill: new RGBA(196, 196, 196, .5),
      stroke: new RGBA(196, 196, 196, 1)
    },

    point: {
      lineWidth: 1,
      fill: new RGBA(255, 255, 255, 1),
      stroke: new RGBA('#007de0'),
    },

    hover: {
      path: {
        lineWidth: 1,
        fill: new RGBA('#007de0'),
        stroke: new RGBA('#007de0')
      },

      point: {
        lineWidth: 1,
        fill: new RGBA('#007de0'),
        stroke: new RGBA('#007de0')
      }
    }
  }

  /** 투명도 */
  opacity = 1

  /** 선택 여부 */
  isSelected = false

  /** 움켜쥠 여부(움켜쥔 상태면 이동가능한 상태) */
  isGrabbed = false

  /**
   * 현재 커서가 위치한 point 의 index(polygon 이고 action 이 add 일 경우에는 path 의 index)
   */
  currentCursorOverPointIndex = -1

  /**
   * 움켜쥔 이후 수행할 동작
   * @type {'move' | 'resize'}
   */
  actionAfterGrab = 'move'

  /**
   * mousedown 일 때 수행할 동작
   * @type {false | 'add'}
   */
  downAction = false

  /**
   * @typedef SubjectConstructor
   * @prop {string} toolType tool 타입
   * @prop {number[][]} points subject 를 구성할 좌표
   * 
   * @param {SubjectConstructor}
   */
  constructor({ toolType, points }) {
    this.toolType = toolType
    this._points = points
  }

  /**
   * @return {import('./layer').default}
   */
  getLayer() {
    return this._layer
  }

  getCtx() {
    return this.getLayer().getCtx()
  }

  getScale() {
    return this.getLayer()?.getScale()?.get()
  }

  getTranslate() {
    return this.getLayer().getScale().getCoord()
  }

  get tool() {
    return Tool.getTool(this.toolType)
  }

  get img() {
    return this.#img
  }

  /**
   * Subject 의 point 간 path 목록
   */
  get pathList() {
    const points = this._points
    const pathList = Array.from({ length: points.length }, (_, i) => {
      const path = new Path2D
      const p1 = points[i]
      const p2 = points[i === points.length - 1 ? 0 : i + 1]

      path.moveTo(p1[0], p1[1])
      path.lineTo(p2[0], p2[1])

      return path
    })

    return pathList
  }

  /** Subject 의 전체 `path` */
  get path() {
    const points = this._points
    const path = new Path2D
    const paintingSubject = this.getLayer().paintingSubject

    if(points.length) {
      path.moveTo(points[0][0], points[0][1])
      points.slice(1).forEach(([x, y]) => {
        path.lineTo(x, y)
      })

      if(
        (this.toolType !== Tool.POLYGON && paintingSubject === this)
        || paintingSubject !== this
      ) {
        path.lineTo(points[0][0], points[0][1])
      }
    }

    return path
  }

  /**
   * @param {number} size 
   */
  getSizeByScale(size) {
    const layer = this.getLayer()
    
    if(layer) {
      const scale = layer.getScale().get()
      
      size = size / scale
    }
    
    return size
  }

  /** Subject 의 `points` */
  get pointData() {
    const size = this.getSizeByScale(6)
    const lineWidth = this.getSizeByScale(1)
    const point = {
      list: [],
      lineWidth
    }

    if(this.toolType === Tool.POINT) {
      point.list = this._points.map(([x, y], i) => {
        const path = new Path2D
  
        path.moveTo(x, y - size)
        path.lineTo(x - size, y)
        path.lineTo(x, y + size)
        path.lineTo(x + size, y)
        path.lineTo(x, y - size)
        path.closePath()

        return path
      })
    } else if(this.isSelected) {
      point.list = this._points.map(([x, y]) => {
        const path = new Path2D
  
        path.ellipse(x, y, size, size, 0, 0, Math.PI * 2)
  
        return path
      })
    }

    return point
  }

  /**
   * only use `toolType` `Point`
   */
  get textBox() {
    if(this.toolType === Tool.POINT) {
      const { meta } = this
      const width = 20
      const height = 16
      const adjustWidth = this.getSizeByScale(width)
      const adjustHeight = this.getSizeByScale(height)

      return this._points.map(([x, y], i) => {
        const textBox = new Path2D

        textBox.moveTo(x, y)
        textBox.lineTo(x, y + this.getSizeByScale(height - 1))
        textBox.lineTo(x + this.getSizeByScale(1), y + adjustHeight)
        textBox.lineTo(x + this.getSizeByScale(width - 1), y + adjustHeight)
        textBox.lineTo(x + adjustWidth, y + this.getSizeByScale(height - 1))
        textBox.lineTo(x + adjustWidth, y + this.getSizeByScale(1))
        textBox.lineTo(x + this.getSizeByScale(width - 1), y)
        textBox.closePath()

        meta.x = x
        meta.y = y

        return {
          fontSize: this.getSizeByScale(10),
          width: adjustWidth,
          height: adjustHeight,
          textBoxPath: textBox
        }
      })[0]
    }
  }

  /** `path` 스타일 */
  get pathStyle() {
    const lineWidth = this.#style.path.lineWidth

    return {
      ...this.#style.path,
      lineWidth: this.getSizeByScale(lineWidth)
    }
  }

  /**
   * @param {{ lineWidth: number, fill: string | RGBA, stroke: string | RGBA }}
   * `path` 스타일 설정
   */
  set pathStyle({ lineWidth = 1, fill, stroke }) {
    const opacity = this.opacity
    const fillRgba = new RGBA(fill ?? this.pathStyle.fill)
    const strokeRgba = new RGBA(stroke ?? this.pathStyle.stroke)
    
    fillRgba.alpha = fillRgba.alpha * opacity / 1
    strokeRgba.alpha = strokeRgba.alpha * opacity / 1

    this.#style.path = {
      lineWidth,
      fill: fillRgba,
      stroke: strokeRgba,
    }
  }

  /** `point` 스타일 */
  get pointStyle() {
    const lineWidth = this.#style.point.lineWidth

    return {
      ...this.#style.point,
      lineWidth: this.getSizeByScale(lineWidth)
    }
  }

  /**
   * @param {{ lineWidth: number, fill: string | RGBA, stroke: string | RGBA }}
   * `point` 스타일 설정
   */
  set pointStyle({ lineWidth = 1, fill, stroke }) {
    const opacity = this.opacity
    const fillRgba = new RGBA(fill ?? this.pointStyle.fill)
    const strokeRgba = new RGBA(stroke ?? this.pointStyle.stroke)
    
    fillRgba.alpha = fillRgba.alpha * opacity / 1
    strokeRgba.alpha = strokeRgba.alpha * opacity / 1

    this.#style.point = {
      lineWidth,
      fill: fillRgba,
      stroke: strokeRgba,
    }
  }

  get hoverPathStyle() {
    const lineWidth = this.#style.hover.path.lineWidth

    return {
      ...this.#style.hover.path,
      lineWidth: this.getSizeByScale(lineWidth)
    }
  }

  get hoverPointStyle() {
    const lineWidth = this.#style.hover.point.lineWidth

    return {
      ...this.#style.hover.point,
      lineWidth: this.getSizeByScale(lineWidth)
    }
  }

  set hoverPointStyle({ lineWidth = 1, fill, stroke }) {
    const fillRgba = new RGBA(fill ?? this.hoverPointStyle.fill)
    const strokeRgba = new RGBA(stroke ?? this.hoverPointStyle.stroke)
    
    this.#style.hover.point = {
      lineWidth,
      fill: fillRgba,
      stroke: strokeRgba,
    }
  }

  /**
   * @param {number[]} p1 이전 좌표 
   * @param {number[]} p2 현재 좌표 
   */
  doActionWhileGrabbed(p1, p2) {
    const { tool, actionAfterGrab } = this

    tool[actionAfterGrab.toUpperCase()](this, p1, p2, this.getScale())
  }

  /**
   * @param {number[]} point 클릭한 좌표
   */
  doActionWhenMousedown(point) {
    const { tool, downAction } = this

    downAction && tool[downAction.toUpperCase()](this, point, this.getScale())
  }

  setActionAfterGrab([x, y]) {
    const ctx = this.getCtx()
    const scale = this.getScale()
    const pointIndex = this.findPointIndexByCoordinate([x, y])
    let cursor = this.tool.getCursor(pointIndex)
    let actionAfterGrab = pointIndex > -1 && this.tool !== PointTool ? 'resize' : 'move'
    let downAction = false

    this.currentCursorOverPointIndex = pointIndex
    this.expectedPoint = []
    
    if(this.tool === PolygonTool) {
      const pathIndex = this.findPathIndexByCoordinate([x, y])

      if(pathIndex > -1) {
        downAction = 'add'
        cursor = this.tool.getCursor(pathIndex, true)
        this.currentCursorOverPointIndex = pathIndex
        this.expectedPoint = [x / scale, y / scale]
      }
    }

    ctx.canvas.style.cursor = cursor
    this.actionAfterGrab = actionAfterGrab
    this.downAction = downAction
  }

  /**
   * x, y 좌표에 Subject 를 구성하고 있는 point 가 몇 번째 index 인지 가져오기
   * @param {number[]}
   */
  findPointIndexByCoordinate([x, y]) {
    const ctx = this.getCtx()
    const scale = this.getScale()
    let index = -1

    this.pointData.list.forEach((p, i) => ctx.isPointInPath(p, x / scale, y / scale) && (index = i))

    return index
  }

  /**
   * x, y 좌표에 Subject 를 구성하고 있는 path 가 몇 번째 index 인지 가져오기
   * @param {number[]}
   */
  findPathIndexByCoordinate([x, y]) {
    const ctx = this.getCtx()
    const scale = this.getScale()
    const pathList = this.pathList
    const pointIndex = this.findPointIndexByCoordinate([x, y])
    const ax = x / scale
    const ay = y / scale
    let index = -1
    
    pathList
      .forEach((p, i) => {
        const nextIndex = i + 1 >= pathList.length ? 0 : i + 1

        if(
          ctx.isPointInStroke(p, ax, ay)
          && i !== pointIndex
          && nextIndex !== pointIndex
        ) index = i
      })

    return index
  }

  /**
   * x, y 좌표가 Subject 내부에 있는지 확인
   * @param {number[]}
   */
  isPointInPath([x, y]) {
    const { path, pointData } = this
    const ctx = this.getCtx()

    return  ctx.isPointInPath(path, x, y)
      || pointData.list.some(p => ctx.isPointInPath(p, x, y))
  }

  /**
   * @param {HTMLImageElement} src 
   */
  setupImage(src) {
    const { width, height } = this.getCtx().canvas
    const imgWidth = src.width
    const imgHeight = src.height
    let dw

    if(imgWidth > imgHeight) {
      dw = width
    } else {
      dw = imgWidth * (height / imgHeight)
    }

    const scale = Math.max(Math.min(dw / imgWidth, 5), .2)
    
    this.#img = {
      src,
      width: imgWidth,
      height: imgHeight,
      x: 0,
      y: 0,
      scale
    }
  }

  setImageCoord(x, y) {
    this.#img.x = x
    this.#img.y = y
  }

  extractPoints() {
    return this._points.map(point => {
      return [point[0] - .5, point[1] - .5].map(v => parseFloat(v.toFixed(2)))
    })
  }
}
