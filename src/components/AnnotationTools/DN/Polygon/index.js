import _ from 'lodash'
import { BaseAnnotationToolProps } from '@/utils/annotationTool'
import { renderDescriptionsAndInstructionDetail } from '@/utils/slots'
import { AnnotationToolMixin } from '@/mixin/annotationTool'
import { RGBA } from '@/utils'
import RawData from './model'
import Labels from './Labels.vue'
import Subject from '@/components/UI/Canvas/subject'

class ToolProps extends BaseAnnotationToolProps {
  context = {
    type: Object,
    default: () => ({
      url: ''
    })
  }

  labels = Array
}

/**
 * @type {import('vue/types/umd').ComponentOptions}
 */
const DNPolygon = {
  name: 'DNPolygon',

  mixins: [AnnotationToolMixin],

  data: () => ({
    error: null,
    tags: ''
  }),

  props: ToolProps.toScheme(),

  computed: {
    colors() {
      const color = Object.values(RGBA.DN_COLOR_NAMES)

      if (this.labels[0].constructor === Array) {
        const result = []
        this.labels?.map((label) => {
          result.push(color.filter(r => r.name === label[1])[0])
        })
        return result

      } else {
        return color
      }
    },

    RawData: () => RawData,

    toolType: () => 'Polygon',

    minAnnotationCount() {
      return this.widgets?.minCount || 1
    }
  },

  watch: {
    result: {
      deep: true,
      handler(result) {
        if (result instanceof this.RawData && !this.loading) {
          this._store()
            .catch(err => console.warn(err.message))
        }
      }
    },

    skip: {
      deep: true,
      handler(skip) {
        this.tags = skip.checked ? skip.value : ''

        if (!this.loading) {
          this._store()
            .catch(err => console.warn(err.message))
        }
      }
    },

    storedTags(storedTags) {

    },

    storedResult(storedResult) {
      const { loading } = this

      if (loading) {
        /** @type {RawData} */
        const rawData = this.context

        if (storedResult instanceof Array) {
          rawData.polygons = storedResult
        }

        this._setResult(this._copyObject(rawData))
      }
    },

    loading(loading) {
      if (!loading) {
        const skip = this.skip

        if (this.storedTags === skip.value) {
          skip.checked = true
        }
      }
    },

    context: {
      deep: true,
      handler() {
        const { context, storedResult } = this

        /** @type {RawData} */
        const rawData = context

        if (storedResult instanceof Array) {
          rawData.polygons = storedResult
        }

        this._setResult(this._copyObject(rawData) ?? ({}))
      }
    }
  },

  methods: {
    validator() {
      return this.skip.checked || this.validateAnnotaionCount()
    },

    validateAnnotaionCount() {
      return this.result?.polygons?.length >= this.minAnnotationCount
    },
    
    /**
     * @param {RawData} rawData 
     */
    _setResult(rawData) {
      this.result = new this.RawData(rawData)

      this.initialize()

      this.$nextTick(() => {
        this.$refs.$canvas && this._drawPolygon()
      })
    },

    /** @param {import('vue').CreateElement} h */
    _renderPalette(h) {
      return h(
        'dn-ui-palette',
        {
          props: {
            getCanvas: () => this.$refs.$canvas,
            noUseTools: ['box', 'point', 'brush', 'eraser', 'dimmer', 'del', 'zoomin', 'zoomout', 'undo', 'redo', 'fitimg', 'originalimg']
          }
        }
      )
    },

    _drawPolygon() {
      /** @type {RawData} */
      const result = this.result
      const labels = this.labels
      const colors = this.colors
      const $canvas = this.$refs.$canvas

      /** @type {import('@/components/UI/Canvas/layer').default} */
      const selectedLayer = $canvas.selectedLayer

      result.polygons.forEach((p, index) => {
        const points = p.points.map(point => {
          return [
            point[0] + .5,
            point[1] + .5
          ]
        })
        const subject = new Subject({ toolType: this.toolType, points })

        const fillColor = Array.isArray(labels[0]) ?
          new RGBA(colors[labels?.findIndex(l => l.includes(p.name))].code) :
          new RGBA(colors[labels?.findIndex(label => label === p.name)].code)

        fillColor.alpha = .25

        subject.meta = { polygon: p }
        subject.pathStyle = {
          lineWidth: 0,
          fill: fillColor
        }

        selectedLayer.addSubject(subject)
      })
    },

    onUpdatePolygon({ subject, isDeleted }) {
      const metaPolygon = subject.meta.polygon

      if (metaPolygon?.name) {
        if (isDeleted) {
          this.result.removePolygonByNameAndIndex(metaPolygon.name, metaPolygon.index)
        } else {
          this.result.updatePolygon(metaPolygon.name, metaPolygon.index, {
            name: metaPolygon.name,
            index: metaPolygon.index,
            points: subject.extractPoints()
          })
        }
      }
    },

    /**
     * @param {{index: number, label: number, color: string}}
     */
    onSelectLabelingGroup({ index, label, color }) {
      const $canvas = this.$refs.$canvas
      const selectedSubject = $canvas.selectedLayer.subjects.filter(s => s.isSelected)[0]

      if(!selectedSubject) return

      /** @type {RawData} */
      const result = this.result
      const newName = this.labels[index].constructor === Array ? this.labels[index][0] : this.labels[index]
      const metaPolygon = selectedSubject.meta.polygon
      const newPoints = selectedSubject.extractPoints()
      const fillColor = new RGBA(color)

      fillColor.alpha = .25

      if (!metaPolygon?.name) {
        const polygon = result.insertPolygon({ name: newName, points: newPoints })

        selectedSubject.meta = { polygon }
        selectedSubject.pathStyle = {
          lineWidth: 0,
          fill: fillColor,
        }
      } else {
        const updatedPolygon = result.updatePolygon(
          metaPolygon.name,
          metaPolygon.index,
          { name: newName, index: label, points: newPoints }
        )

        if (updatedPolygon) {
          selectedSubject.meta = { polygon: updatedPolygon }
          selectedSubject.pathStyle = {
            lineWidth: 0,
            fill: fillColor,
          }
        }
      }
    },

    onClickLabel({ index, label }) {
      const name = this.labels[index].constructor === Array ? this.labels[index][0] : this.labels[index]
      const selectedLayer = this.$refs.$canvas.selectedLayer

      selectedLayer.subjects
        .forEach(s => {
          const polygon = s.meta.polygon

          s.isSelected = polygon?.name === name && polygon?.index === label
        })
    },

    onRemoveLabel({ index, label }) {
      const name = this.labels[index].constructor === Array ? this.labels[index][0] : this.labels[index]
      const selectedLayer = this.$refs.$canvas.selectedLayer
      let subjectIndex = -1

      selectedLayer.subjects
        .some(({ meta: { polygon } }, i) => {
          if (polygon?.name === name && polygon?.index === label) {
            subjectIndex = i

            return true
          }
        })

      this.result.removePolygonByNameAndIndex(name, label)
      selectedLayer.removeSubject(subjectIndex)
    }
  },

  component: {
    Labels
  },

  created() {
    this._setConfig({
      noEditByReviewMode: false
    })

    this._setSkip({
      use: true,
      message: '레이블할 영역이 없습니다.',
      value: 'bad-data'
    })
  },

  render(h) {
    const { title, progress, hasRejectReason, config, loading, result } = this
    const renderPalette = _.partial(this._renderPalette, h)

    return (
      <dn-annotation-layout-type-a
        title={title}
        progress={progress}
        has-reject-reason={hasRejectReason}
        config={config}
      >
        {...renderDescriptionsAndInstructionDetail(h, this.$slots.default)}
        <template slot="main">
          <dn-ui-segment
            style={{
              height: '100%'
            }}
            loading={loading}
            no-padding
          >
            {result.url ? <dn-ui-canvas
              onUpdateSubject={this.onUpdatePolygon}
              ref="$canvas"
              background-image-url={result.url}
            /> : void (0)}
          </dn-ui-segment>
        </template>

        <template slot="right-side">
          <dn-ui-segment no-padding>
            <dn-ui-section-header title="Labels" no-use-close />

            <Labels
              labelGroups={this.labels}
              polygons={this.result.polygons}
              onSelect={this.onSelectLabelingGroup}
              onClickLabel={this.onClickLabel}
              onRemoveLabel={this.onRemoveLabel}
            />
          </dn-ui-segment>
        </template>

        <template slot="toolbar">
          {renderPalette()}
        </template>
      </dn-annotation-layout-type-a>
    )
  }
}

export default DNPolygon


