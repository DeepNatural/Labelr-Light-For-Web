<template>
  <div class="dn-canvas" style="position: relative;">
    <div style="position: absolute; bottom: 0; left: 0; background-color: #000; color: #fff; user-select: none;">
      <span>scale: {{ scaleValue }}</span>
      |
      <span>coord: {{ coord }}</span>
    </div>
    <canvas ref="$canvas"></canvas>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import { fromEvent, from } from 'rxjs'
import { map, filter, distinctUntilChanged } from 'rxjs/operators'
import {
  Tool,
  BoxTool,
  PolygonTool,
  // LineTool,
  PointTool,
  SelectTool,
  MoveTool,
  Subject,
  Layer,
  CanvasScale,
} from './container'

export default {
  name: 'DNCanvas',

  data: () => ({
    paintId: -1,

    /** @type {HTMLCanvasElement} */
    canvas: null,

    /** @type {'box' | 'polygon' | 'select'} */
    toolName: '',

    /**
     * @type {import('rxjs').Subscription[]}
     */
    _subscriptions: [],

    layerId: '',

    /**
     * @type {{ [x: string]: Layer }}
     */
    layerMap: {},

    /** @type {CanvasScale} */
    scale: null,

    pressedSpacebar: false,

    scaleValue: 0,
    coord: { x: 0, y: 0 },

    selectedTool: {
      painter: null,
      controller: null
    }
  }),

  props: {
    backgroundImageUrl: String
  },

  computed: {
    /** @return {CanvasRenderingContext2D} */
    ctx() {
      return this.canvas?.getContext('2d')
    },

    tools() {
      return {
        box: new BoxTool,
        polygon: new PolygonTool,
        // line: new LineTool,
        point: new PointTool,
        select: new SelectTool,
        move: new MoveTool
      }
    },

    layers() {
      return Object.values(this.layerMap)
    },

    selectedLayer() {
      const layer = this.layerMap[this.layerId]

      return layer
    },

    ...mapState('annotationTool', [
      'visibleInstruction',
      'theme'
    ])
  },

  watch: {
    pressedSpacebar(value) {
      const painterName = this.selectedTool.painter?.name

      this.selectTool({
        painterName,
        controllerName: value ? 'move' : painterName ? null : 'select'
      })
    },

    backgroundImageUrl() {
      this.init()
      this.setSize(this.$el.offsetWidth, this.$el.offsetHeight)
    },

    visibleInstruction() {
      this.resizeCanvasAndAdjustSubjectPoints()
    }
  },

  methods: {
    getCanvasX() {
      return this.canvas?.getBoundingClientRect().x
    },

    getCanvasY() {
      return this.canvas?.getBoundingClientRect().y
    },

    setSize(width, height) {
      this.canvas.width = width
      this.canvas.height = height
    },

    resizeCanvasAndAdjustSubjectPoints() {
      setTimeout(() => {
        const { subjects, paintingSubject } = this.selectedLayer
        const scale = this.scale
        const scaleValue = scale.get()
        const coord = scale.getCoord()
        const prev = [this.canvas.width, this.canvas.height]
        
        this.setSize(this.$el.offsetWidth, this.$el.offsetHeight)

        const current = [this.canvas.width, this.canvas.height]
        const diff = [current[0] - prev[0], current[1] - prev[1]].map(v => v / 2)
        
        subjects.forEach(s => {
          if(s.toolType !== 'Image') {
            s._points = s._points.map(([x, y]) => {
              return [x - diff[0], y - diff[1]]
            })
          } else {
            s.setImageCoord(s.img.x - diff[0], s.img.y - diff[1])
          }
        })

        if(paintingSubject) {
          paintingSubject.points = paintingSubject.meta.points
            .map(([x, y], i, points) => {
              points[i] = [x - diff[0], y - diff[1]]
              return points[i]
            })
        }

        scale.set(scaleValue, {
          x: coord.x + diff[0] * 2,
          y: coord.y + diff[1] * 2,
        })
      }, 350)
    },

    init() {
      this.removeAllLayer()
      this.scale = new CanvasScale(this.canvas, {
        onChangeScale: scale => {
          this.$emit('changeScale', scale)
        }
      })
      this.setEvent()
      this.layerId = this.createLayer().id
      this.setupImage(this.selectedLayer, this.backgroundImageUrl)
      this._paint()
    },

    setEvent() {
      this._subscriptions?.forEach(s => {
        s?.unsubscribe()
      })
      
      const scale = this.scale
      const { canvas } = this
      const eventNames = ['move', 'down', 'up']
      const basePipe = [
        filter(e => e.target === canvas),
        map(e => {
          const originalX = e.clientX - this.getCanvasX()
          const originalY = e.clientY - this.getCanvasY()

          return {
            type: e.type,
            x: Number((originalX + .5).toFixed(1)) - scale.getCoord().x,
            y: Number((originalY + .5).toFixed(1)) - scale.getCoord().y,
            originalX,
            originalY,
            scale: scale.get()
          }
        })
      ]
      const moveBasePipe = [
        ...basePipe,
        distinctUntilChanged((before, current) => {
          if(before.type === current.type && current.type === 'mousemove') {
            return before.x === current.x && before.y === current.y
          }

          return false
        })
      ]
      const subscriptions = eventNames.map(name => {
        return fromEvent(document.body, `mouse${name}`)
          .pipe(...(name === 'move' ? moveBasePipe : basePipe))
          .subscribe(coord => {
            if(
              !this.pressedSpacebar
              && !(this.selectedTool.controller instanceof MoveTool)
            ) {
              if(coord.type === 'mouseup') {
                const subject = this.selectedLayer.subjects.filter(v => v.isSelected)[0]
                
                if(subject) this.$emit('updateSubject', { subject })
              }

              this.selectedTool.controller?.[name](coord)
              this.selectedTool.painter?.[name](coord)
            } else {
              this.tools.move[name](coord)
            }
          })
      })

      subscriptions.push(
        fromEvent(document.body, `mouseout`)
          .subscribe(() => {
            this.selectedTool.controller?.up({ x: 0, y: 0 })
            this.selectedTool.painter?.up({ x: 0, y: 0 })
          })
      )

      subscriptions.push(
        fromEvent(this.$refs.$canvas, 'mousewheel')
          .subscribe(e => {
            e.preventDefault()

            const x = e.clientX - this.getCanvasX()
            const y = e.clientY - this.getCanvasY()

            scale.zoom(x, y, e.deltaY)
          })
      )

      subscriptions.push(
        fromEvent(window, 'keydown')
          .pipe(filter(e => e.keyCode === 32))
          .subscribe(() => this.pressedSpacebar = true)
      )

      subscriptions.push(
        fromEvent(window, 'keydown')
          .pipe(
            filter(e => ['Delete', 'Backspace'].filter(k => k === e.key).length)
          )
          .subscribe(() => {
            if(this.selectedTool.painter instanceof PolygonTool) {
              this.selectedTool.painter.popPoint()
            } else {
              this.selectedLayer.subjects
                .forEach((subject, index) => {
                  if(subject.isSelected) {
                    this.selectedLayer.removeSubject(index)
  
                    this.$emit('updateSubject', { subject, isDeleted: true })
                  }
                })
            }
          })
      )

      subscriptions.push(
        fromEvent(window, 'keyup')
          .pipe(filter(e => e.keyCode === 32))
          .subscribe(() => this.pressedSpacebar = false)
      )

      subscriptions.push(
        fromEvent(window, 'resize')
          .subscribe(() => {
            this.resizeCanvasAndAdjustSubjectPoints()
          })
      )

      subscriptions.push(
        fromEvent(window, 'keydown')
          .pipe(
            filter(() => this.selectedLayer.selectedSubject),
            map(e => e.key)
          )
          .subscribe(key => {
            this.selectedLayer.selectedSubject._points.forEach(point => {
              switch(key) {
                case 'ArrowUp': point[1]--; break
                case 'ArrowDown': point[1]++; break
                case 'ArrowLeft': point[0]--; break
                case 'ArrowRight': point[0]++; break
              }
            })
          })
      )

      this._subscriptions = [...subscriptions]
    },

    removeLayerById(id) {
      this.$delete(this.layerMap, id)
    },

    removeAllLayer() {
      Object.keys(this.layerMap)
        .forEach(this.removeLayerById)
    },

    createLayer() {
      const layer = new Layer

      this.$set(this.layerMap, layer.id, layer)

      Object.defineProperties(layer, {
        _ctx: {
          enumerable: false,
          configurable: false,
          get: () => this.ctx
        },

        _scale: {
          enumerable: false,
          configurable: false,
          get: () => this.scale
        }
      })

      return layer
    },

    clear() {
      const { width, height } = this.canvas

      this.ctx.clearRect(0, 0, width, height)
    },

    /**
     * @param {{
     *  painterName: 'box' | 'polygon'
     *  controllerName: 'select' | 'move'
     * }}
     */
    selectTool({ painterName, controllerName }) {
      const painterToolName = painterName?.toLowerCase()
      const controllerToolName = controllerName?.toLowerCase()
      const { selectedTool, tools } = this
      const painter = tools[painterToolName]
      const controller = tools[controllerToolName]

      this.canvas.style.cursor = painter?.cursor ?? controller?.cursor ?? 'default'

      selectedTool.painter = painter
      selectedTool.controller = controller
    },

    /**
     * @param {Layer} layer
     * @param {string} img
     * @param {number} errorCount
     */
    setupImage(layer, img, errorCount = 0) {
      let imgSource

      if(errorCount === 5) return

      if(typeof img === 'string') {
        const _img = new Image

        _img.onload = () => {
          this._setImageInSubject(layer, _img)
        }

        _img.onerror = err => {
          console.warn(err)
          _img.remove()
          setTimeout(() => {
            this.setupImage(layer, img, errorCount + 1)
          }, 500)
        }
        _img.src = img
      } else if(img instanceof HTMLImageElement) {
        this._setImageInSubject(layer, img)
      }
    },

    /**
     * @param {Layer} layer
     * @param {HTMLImageElement} imgElem
     */
    _setImageInSubject(layer, imgElem) {
      const imgSource = imgElem
      const subject = new Subject({
        toolType: 'Image',
        points: [],
        imgSource
      })

      layer.addSubject(subject, 0)

      subject.setupImage(imgSource)

      const coord = this.scale.getCoord()
      const img = subject.img
      const { width, height } = this.canvas
      const nextScale = img.scale

      this.scale.set(nextScale, {
        x: (width - img.width * nextScale) / 2,
        y: (height - img.height * nextScale) / 2
      })
    },

    _paint() {
      window.cancelAnimationFrame(this.paintId)

      this.paintId = window.requestAnimationFrame(time => {
        this.clear()
        this._drawCanvas()
        this._paint()
      })
    },

    _drawCanvas() {
      /**
       * @type {{ctx: CanvasRenderingContext2D}}
       */
      const {
        ctx,
        canvas,
        selectedTool: { painter, controller },
        selectedLayer,
        layers,
        scale
      } = this
      const subjectsInSelectedLayer = selectedLayer?.subjects ?? []
      const paintingSubject = selectedLayer?.paintingSubject
      const scaleValue = scale.get()
      const coord = scale.getCoord()

      this.scaleValue = scaleValue
      this.coord = coord

      ctx.beginPath()

      ctx.fillStyle = this.theme === 'day' ? '#ffffff' : '#191927'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.closePath()

      ctx.save()
      ctx.resetTransform()
      ctx.transform(scaleValue, 0, 0, scaleValue, coord.x, coord.y)

      layers
        .filter(l => l.visible)
        .forEach(layer => {
          const { subjects } = layer
          /** @type {Subject[]} */
          const _subjects = paintingSubject
            ? subjects.concat([paintingSubject]) : subjects
          
          _subjects.forEach(subject => {
            const {
              toolType,
              path,
              pointData,
              pathStyle,
              pointStyle,
              hoverPathStyle,
              hoverPointStyle,
              currentCursorOverPointIndex,
              downAction,
              expectedPoint
            } = subject
            
            ctx.beginPath()

            switch(toolType) {
              case 'Image': {
                const img = subject.img

                ctx.drawImage(img.src, img.x, img.y, img.width, img.height)
                break
              }
              case Tool.POLYGON:
              case Tool.BOX:
                ctx.lineWidth = pathStyle.lineWidth
                ctx.fillStyle = pathStyle.fill.toString()
                ctx.strokeStyle = pathStyle.stroke.toString()
                // console.debug(pathStyle.lineWidth)
                ctx.fill(path)
                if(pathStyle.lineWidth) ctx.stroke(path)
                break
              case Tool.POINT: {
                const {
                  textBox: {
                    textBoxPath,
                    fontSize,
                    width,
                    height
                  },
                  meta: { index, x, y }
                } = subject

                ctx.stroke(path)

                ctx.lineWidth = 0
                ctx.fillStyle = pointStyle.fill.toString()
                ctx.strokeStyle = pointStyle.stroke.toString()
                ctx.fill(textBoxPath)

                ctx.fillStyle = '#fff'
                ctx.font = `600 ${fontSize}px Noto Sans KR`
                
                const textMetrics = ctx.measureText(index ?? '')
                const textMetricsHeight = textMetrics.fontBoundingBoxAscent - textMetrics.fontBoundingBoxDescent
                const textX = x + (width - textMetrics.width) / 2
                const textY = y + (height * 1.72 - textMetricsHeight / 2) / 2

                ctx.fillText(index ?? '', textX, textY)
              }
            }

            ctx.closePath()

            if(toolType === Tool.POLYGON && downAction === 'add') {
              const { pathList } = subject

              ctx.beginPath()

              ctx.lineWidth = hoverPathStyle.lineWidth
              ctx.fillStyle = hoverPathStyle.fill.toString()
              ctx.strokeStyle = hoverPathStyle.stroke.toString()
              ctx.fill(pathList[currentCursorOverPointIndex])
              ctx.stroke(pathList[currentCursorOverPointIndex])

              ctx.closePath()
            }

            pointData.list.forEach((point, i) => {
              ctx.beginPath()

              if(
                currentCursorOverPointIndex === i
                && subject.toolType === Tool.POINT
              ) {
                ctx.lineWidth = hoverPointStyle.lineWidth
                ctx.fillStyle = hoverPointStyle.fill.toString()
                ctx.strokeStyle = hoverPointStyle.stroke.toString()

                if(subject.toolType === Tool.POINT) {
                  const {
                    textBox: {
                      textBoxPath,
                      fontSize,
                      width,
                      height
                    },
                    meta: { index, x, y }
                  } = subject

                  ctx.fill(textBoxPath)

                  ctx.fillStyle = '#fff'
                  ctx.font = `600 ${fontSize}px Noto Sans KR`
                  
                  const textMetrics = ctx.measureText(index ?? '')
                  const textMetricsHeight = textMetrics.fontBoundingBoxAscent - textMetrics.fontBoundingBoxDescent
                  const textX = x + (width - textMetrics.width) / 2
                  const textY = y + (height * 1.72 - textMetricsHeight / 2) / 2

                  ctx.fillText(index ?? '', textX, textY)
                }
              } else if(
                currentCursorOverPointIndex === i
                && !downAction
              ) {
                ctx.lineWidth = hoverPointStyle.lineWidth
                ctx.fillStyle = hoverPointStyle.fill.toString()
                ctx.strokeStyle = hoverPointStyle.stroke.toString()
              } else {
                ctx.lineWidth = pointStyle.lineWidth
                ctx.fillStyle = pointStyle.fill.toString()
                ctx.strokeStyle = pointStyle.stroke.toString()
              }

              ctx.fill(point)
              ctx.stroke(point)

              ctx.closePath()
            })

            if(expectedPoint.length === 2) {
              const point = new Path2D

              point.ellipse(
                expectedPoint[0], expectedPoint[1],
                subject.getSizeByScale(6), subject.getSizeByScale(6),
                0, 0,
                Math.PI * 2
              )

              ctx.beginPath()

              ctx.lineWidth = pointStyle.lineWidth
              ctx.fillStyle = pointStyle.fill.toString()
              ctx.strokeStyle = pointStyle.stroke.toString()

              ctx.fill(point)
              ctx.stroke(point)

              ctx.closePath()
            }
          })
        })
      
      if(controller instanceof SelectTool) {
        controller.observeCoordinate(({ x, y }) => {
          const subject = _.last(
            subjectsInSelectedLayer
              .filter(s => s.isPointInPath([x + coord.x, y + coord.y]))
          )

          return Promise.resolve({
            layer: selectedLayer,
            subject
          })
        })
      } else if(controller instanceof MoveTool) {
        controller.observeCoordinate(({ x, y }) => {
          scale.set(scaleValue, {
            x: coord.x + x,
            y: coord.y + y,
          })
        })
      }
      
      painter?.drawing(
        (paintingSubject) => {
          selectedLayer.releaseAllSubjects(true)
          selectedLayer.paintingSubject = paintingSubject
        },
        subject => {
          selectedLayer.addSubject(subject)
          selectedLayer.paintingSubject = null

          this.$emit('addSubjectInLayer', {
            layerId: selectedLayer.id,
            subject
          })
          // this.selectTool({ controllerName: 'select' })
        }
      )

      ctx.restore()
    },
  },

  mounted() {
    this.canvas = this.$refs.$canvas

    this.setSize(this.$el.offsetWidth, this.$el.offsetHeight)
    this.init()
    this.selectTool({
      controllerName: 'select'
    })
  },

  destroyed() {
    this._subscriptions?.forEach(s => {
      s?.unsubscribe()
    })

    window.cancelAnimationFrame(this.paintId)
  }
}
</script>

<style lang="scss" scoped>
.dn-canvas {
  height: 100%;
}
</style>
