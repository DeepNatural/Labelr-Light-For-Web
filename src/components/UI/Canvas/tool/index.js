import Subject from '../subject'

export default class Tool {
  static BOX = 'Box'
  static POLYGON = 'Polygon'
  static LINE = 'Line'
  static POINT = 'Point'
  static SELECT = 'Select'
  static MOVE = 'Move'
  static DELETE = 'Delete'
  static SCALE = 'Scale'

  /**
   * @param {string} toolType 
   * @returns {BoxTool | PolygonTool | SelectTool | MoveTool | DeleteTool | PointTool}
   */
  static getTool(toolType) {
    switch(toolType) {
      case Tool.BOX: return BoxTool
      case Tool.POLYGON: return PolygonTool
      case Tool.POINT: return PointTool
      // case Tool.LINE: return LineTool
      case Tool.SELECT: return SelectTool
      case Tool.MOVE: return MoveTool
      case Tool.DELETE: return DeleteTool
    }
  }

  /**
   * @type {Subject}
   * 페인트 계열 Tool(Box, Polygon, Point, Line)을 사용하는 `Subject`
   */
  paintingSubject = null

  /** @param {{ x: number, y: number, scale: number }} */
  move({ x, y, scale }) {}
  /** @param {{ x: number, y: number, scale: number }} */
  down({ x, y, scale }) {}
  /** @param {{ x: number, y: number, scale: number }} */
  up({ x, y, scale }) {}

  name = ''
  toolType = ''

  isStart = false
  isClicked = false

  start = { x: 0, y: 0 }
  end = { x: 0, y: 0 }

  /** @type {number[][]} */
  points = []

  cursor = 'default'

  init() {
    this.isStart = false
    this.isClicked = false
    this.start = { x: 0, y: 0 }
    this.end = { x: 0, y: 0 }
    this.points = []
    this.paintingSubject = null
  }

  get path() {
    return new Path2D
  }

  toSubject() {
    const { toolType, points } = this

    return new Subject({ toolType, points })
  }

  /**
   * @param {(param1: { path: Path2D, points: Path2D[] }, param2: { path: { [x: string]: number | string }, point: { [x: string]: any } }) => void} callback 
   * @param {(subject: Subject) => void endCallback 
   */
  drawing(callback, endCallback) {}
}

export class BoxTool extends Tool {
  name = 'Box'
  toolType = Tool.BOX

  static POINT_MAPPER = [
    { x: 0, y: 0, cursor: 'nwse-resize', center: { x: 0, y: 0 }  },
    { x: 0, y: 1, cursor: 'ew-resize', center: { x: 0, y: 1 }  },
    { x: 0, y: 2, cursor: 'nesw-resize', center: { x: 0, y: 0 }  },
    { x: 1, y: 2, cursor: 'ns-resize', center: { x: 1, y: 0 }  },
    { x: 2, y: 2, cursor: 'nwse-resize', center: { x: 0, y: 0 }  },
    { x: 2, y: 1, cursor: 'ew-resize', center: { x: 0, y: 1 }  },
    { x: 2, y: 0, cursor: 'nesw-resize', center: { x: 0, y: 0 }  },
    { x: 1, y: 0, cursor: 'ns-resize', center: { x: 1, y: 0 }  },
  ]

  /**
   * @param {number} index
   */
  static getCursor(index) {
    return BoxTool.POINT_MAPPER[index]?.cursor ?? 'default'
  }

  /**
   * @param {Subject} subject
   * @param {number[]} p1 
   * @param {number[]} p2 
   * @param {number} scale
   */
  static MOVE(subject, [x1, y1], [x2, y2], scale) {
    const [sx, sy] = [(x2 - x1) / scale, (y2 - y1) / scale]

    subject._points = subject._points.map(([x, y]) => [(x + sx), (y + sy)])
  }

  /**
   * @param {Subject} subject
   * @param {number[]} p1 
   * @param {number[]} p2 
   * @param {number} scale
   */
  static RESIZE(subject, [x1, y1], [x2, y2], scale) {
    const index = subject.currentCursorOverPointIndex
    const [sx, sy] = [(x2 - x1) / scale, (y2 - y1) / scale]
    const point = BoxTool.POINT_MAPPER[index]

    if(point) {
      const _points = subject._points

      BoxTool.POINT_MAPPER.forEach(({ x, y, center }, i) => {
        if(point.x === x && !center.x) {
          subject._points[i][0] += sx
        }

        if(point.y === y && !center.y) {
          subject._points[i][1] += sy
        }
      })

      BoxTool.POINT_MAPPER.forEach(({ center }, i) => {
        if(i !== index && (center.x || center.y)) {
          const [px, py] = _points[i - 1]
          const [nx, ny] = _points[i + 1] ?? _points[0]
          
          subject._points[i][0] = ((nx + px) / 2)
          subject._points[i][1] = ((ny + py) / 2)
        }
      })
    }
  }

  down({ x, y, scale }) {
    const ax = x / scale
    const ay = y / scale

    if(!this.isStart) {
      this.paintingSubject = new Subject({
        toolType: this.toolType,
        points: this.points
      })
      this.paintingSubject.isSelected = true
      this.paintingSubject.pathStyle = {
        fill: '#00000000'
      }
    }

    this.isStart = true
    this.isClicked = true
    this.start.x = ax
    this.start.y = ay
  }

  up({ x, y }) {
    this.isClicked = false
    this.end.x = x
    this.end.y = y
  }

  move({ x, y, scale }) {
    const ax = x / scale
    const ay = y / scale

    if(this.isClicked) {
      const { start } = this

      this.end.x = x
      this.end.y = y

      this.points = [
        [start.x, start.y],
        [start.x, ay],
        [ax, ay],
        [ax, start.y]
      ]

      this.paintingSubject._points = this.points
    }
  }

  cursor = 'crosshair'

  get path() {
    const { start, points } = this
    const path = new Path2D

    path.moveTo(start.x, start.y)
    points.forEach(([x, y]) => {
      path.lineTo(x, y)
    })
    path.lineTo(start.x, start.y)

    return path
  }

  toSubject() {
    const { paintingSubject, points } = this

    paintingSubject.pathStyle = {
      fill: 'rgba(196, 196, 196, .5)',
      stroke: 'rgba(196, 196, 196, 1)',
    }

    paintingSubject._points = Array.from(
      { length: points.length * 2 },
      (_, i) => {
        if(i % 2) {
          const p1 = points[Math.floor(i / 2)]
          const p2 = points[Math.ceil(i / 2)] ?? points[0]
          
          return [(p2[0] + p1[0]) / 2, (p2[1] + p1[1]) / 2]
        } else {
          return points[i / 2]
        }
      }
    )

    return paintingSubject
  }

  /**
   * @param {(param1: { path: Path2D, points: Path2D[] }, param2: { path: { [x: string]: number | string }, point: { [x: string]: any } }) => void} callback 
   * @param {(subject: Subject) => void endCallback 
   */
  drawing(callback, endCallback) {
    const { isClicked, isStart } = this
    if(isStart) {
      if(isClicked) {
        callback(this.paintingSubject)
      } else {
        endCallback(this.toSubject())
        this.init()
      }
    }
  }
}

export class PolygonTool extends Tool {
  name = 'Polygon'
  toolType = Tool.POLYGON

  /**
   * @param {number} index
   * @param {boolean} isPath
   */
  static getCursor(index, isPath = false) {
    return (isPath && index >= 0 ? 'crosshair' : 'default') || 'default'
  }

  /**
   * @param {Subject} subject
   * @param {number[]} p1 
   * @param {number[]} p2 
   * @param {number} scale
   */
  static MOVE(subject, [x1, y1], [x2, y2], scale) {
    const scalar = [(x2 - x1) / scale, (y2 - y1) / scale]

    subject._points = subject._points
      .map(([x, y]) => [x + scalar[0], y + scalar[1]])
  }

  /**
   * @param {Subject} subject
   * @param {number[]} p1 
   * @param {number[]} p2 
   * @param {number} scale
   */
  static RESIZE(subject, [x1, y1], [x2, y2], scale) {
    const index = subject.currentCursorOverPointIndex
    const point = subject._points[index]

    if(point) {
      const scalar = [(x2 - x1) / scale, (y2 - y1) / scale]

      subject._points[index][0] += scalar[0]
      subject._points[index][1] += scalar[1]
    }
  }

  /**
   * @param {Subject} subject
   * @param {number[]} addPoint
   * @param {number} scale
   */
  static ADD(subject, [x, y], scale) {
    const index = subject.currentCursorOverPointIndex
    const _points = subject._points

    subject._points = [
      ..._points.slice(0, index + 1),
      [x / scale, y / scale],
      ..._points.slice(index + 1)
    ]

    /**
     * point 가 추가 됐으므로, downAction 은 초기화
     * point 가 추가 됐으므로, currentCursorOverPointIndex 를 하나 올려준다.
     * point 가 추가 됐으므로, 예측 포인트 제거
     */
    subject.downAction = false
    subject.currentCursorOverPointIndex += 1
    subject.setActionAfterGrab([x, y])
    subject.expectedPoint = []
  }

  down({ x, y, scale }) {
    const ax = x / scale
    const ay = y / scale
    
    if(this.isStart) {
      const isStartPoint = [this.points[0]].some(([sx, sy]) => {
        if(
          (ax >= sx - 4 && ax <= sx + 4)
          && (ay >= sy - 4 && ay <= sy + 4)
        ) {
          return true
        }
      })

      if(isStartPoint) {
        this.points.push([this.start.ax, this.start.ay])
        this.isClicked = false
      } else {
        this.points.push([ax, ay])
      }

      this.paintingSubject._points = this.points
    } else {
      this.isClicked = true
      this.isStart = true
      this.start.x = ax
      this.start.y = ay
      this.points = [[ax, ay]]
      this.paintingSubject = new Subject({
        toolType: this.toolType,
        points: this.points
      })
      this.paintingSubject.meta = {
        points: this.points
      }
      this.paintingSubject.isSelected = true
      this.paintingSubject.pathStyle = {
        fill: '#00000000'
      }
    }
  }

  cursor = 'crosshair'

  get path() {
    const { start, points } = this
    const path = new Path2D

    path.moveTo(start.x, start.y)
    points.slice(1).forEach(([x, y]) => {
      path.lineTo(x, y)
    })

    return path
  }

  popPoint() {
    this.points.pop()

    if(!this.points.length) this.init()
  }

  /**
   * @param {(param1: { path: Path2D, points: Path2D[] }, param2: { path: { [x: string]: number | string }, point: { [x: string]: any } }) => void} callback 
   * @param {(subject: Subject) => void endCallback 
   */
  drawing(callback, endCallback) {
    const { isClicked, isStart } = this

    if(isStart) {
      if(isClicked) {
        callback(this.paintingSubject)
      } else {
        endCallback(this.toSubject())
        this.init()
      }
    }
  }

  toSubject() {
    const { paintingSubject, points } = this

    paintingSubject.pathStyle = {
      fill: 'rgba(196, 196, 196, .5)',
      stroke: 'rgba(196, 196, 196, 1)',
    }

    paintingSubject._points = points.slice(0, points.length - 1)

    return paintingSubject
  }
}

export class SelectTool extends Tool {
  name = 'Select'
  toolType = Tool.SELECT

  /** @type {Subject} */
  handlingSubject = null
  currentEvent = null

  down({ x, y }) {
    const { handlingSubject, start, end } = this

    start.x = x
    start.y = y
    end.x = x
    end.y = y

    if(handlingSubject instanceof Subject) {
      setTimeout(() => {
        handlingSubject.isGrabbed = true
      }, 30)

      handlingSubject.doActionWhenMousedown([x, y])
    }

    this.isClicked = true
    this.currentEvent = 'down'
  }

  move({ x, y }) {
    const { handlingSubject, start, end } = this

    start.x = end.x
    start.y = end.y

    end.x = x
    end.y = y
    
    if(handlingSubject instanceof Subject) {
      if(handlingSubject.isGrabbed) {
        handlingSubject.doActionWhileGrabbed([start.x, start.y], [x, y])
      } else {
        handlingSubject.setActionAfterGrab([x, y])
      }
    }

    this.currentEvent = 'move'
  }

  up(/*{ x, y }*/) {
    const { handlingSubject } = this

    if(handlingSubject instanceof Subject) {
      handlingSubject.isGrabbed = false
    }

    this.isClicked = false
    this.currentEvent = 'up'

    setTimeout(() => { this.currentEvent = null }, 30)
  }

  /**
   * 현재 좌표(x, y)를 관측하여 `getLayerAndSubject` 함수를 통해 선택된 `layer` 와 `subject` 를 가져옴
   * 
   * @param {(start: { x: number, y: number }) => Promise<{ layer: import('../layer').default, subject: import('../subject').default }>} getLayerAndSubject 
   */
  observeCoordinate(getLayerAndSubject) {
    const { start } = this

    getLayerAndSubject(start)
      .then(({ layer, subject }) => {
        const { handlingSubject, currentEvent } = this

        if (this.isClicked) {
          /**
           * 핸들링 하고 있는 Subject 의 `isGrabbed` 가 `false` 여야
           * 다른 Subject 를 선택할 수 있는 상태
           * currentEvent 가 'down' 일 경우에만 Subject 를 선택 가능
           */
          if (
            !(handlingSubject && handlingSubject.isGrabbed)
            && currentEvent === 'down'
          ) {
            layer.releaseAllSubjects()
  
            subject && (subject.isSelected = true)
  
            this.handlingSubject = subject
          }
        } else {
          if (subject?.toolType === Tool.POINT) {
            /**
             * Point 툴의 경우, currentEvent 가 'down', 'move' 일 경우에만
             * Subject 를 선택 가능
             */
            layer.releaseAllSubjects()
            if (
              !(handlingSubject)
              && (currentEvent === 'down'
              || currentEvent === 'move')
            ) {
              subject && (subject.isSelected = true)
              
              this.handlingSubject = subject
            } else {
              this.handlingSubject = null
            }
          }
        }
      })
  }
}

export class MoveTool extends Tool {
  name = 'Move'
  toolType = Tool.MOVE

  down({ originalX, originalY }) {
    const { start } = this

    start.x = originalX
    start.y = originalY

    this.isClicked = true
  }

  move({ originalX, originalY }) {
    const { isClicked, start, end } = this

    if(isClicked) {
      end.x = originalX - start.x
      end.y = originalY - start.y

      start.x = originalX
      start.y = originalY
    }
  }

  up() {
    this.start = { x: 0, y: 0 }
    this.end = { x: 0, y: 0 }
    this.isClicked = false
  }

  /**
   * @param {(end: { x: number, y: number }) => void} returnEndPoint 
   */
  observeCoordinate(returnEndPoint) {
    if(this.isClicked) {
      const { end } = this

      if(end.x && end.y) {
        returnEndPoint(end)

        end.x = 0
        end.y = 0
      }
    }
  }
}

export class DeleteTool extends Tool {
  name = 'Delete'
  toolType = Tool.DELETE
}


export class PointTool extends Tool {
  name = 'Point'
  toolType = Tool.POINT

  cursor = 'crosshair'

  static getCursor(index) {
    return index >= 0 ? 'pointer' : 'default'
  }

  /**
   * @param {Subject} subject
   * @param {number[]} p1 
   * @param {number[]} p2 
   * @param {number} scale
   */
  static MOVE(subject, [x1, y1], [x2, y2], scale) {
    const scalar = [(x2 - x1) / scale, (y2 - y1) / scale]

    subject._points = subject._points
      .map(([x, y]) => [x + scalar[0], y + scalar[1]])
  }

  down({ x, y, scale }) {
    const ax = x / scale
    const ay = y / scale

    this.points.push([ax, ay])
    this.isStart = true
    this.isClicked = true

    this.paintingSubject = new Subject({
      toolType: this.toolType,
      points: this.points
    })
    this.paintingSubject.isSelected = true
    this.paintingSubject.pathStyle = {
      fill: '#00000000'
    }
  }

  up() {
    this.isClicked = false
  }

  toSubject() {
    const { paintingSubject } = this

    paintingSubject.pathStyle = {
      fill: 'rgba(196, 196, 196, .5)',
      stroke: 'rgba(196, 196, 196, 1)',
    }

    return paintingSubject
  }

  /**
   * @param {(param1: { path: Path2D, points: Path2D[] }, param2: { path: { [x: string]: number | string }, point: { [x: string]: any } }) => void} callback 
   * @param {(subject: Subject) => void endCallback 
   */
  drawing(callback, endCallback) {
    const { isStart, isClicked } = this

    if(isStart) {
      if(isClicked) {
        callback(this.paintingSubject)
      } else {
        endCallback(this.toSubject())
        this.init()
      }
    }
  }
}
