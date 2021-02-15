import { renderDescriptionsAndInstructionDetail } from '../../../../utils/slots'
import { AnnotationToolMixin } from '../../../../mixin/annotationTool'
import { paper, Path, Rectangular } from '@/utils/Paper'
import { Annotation, Instance, InstanceList } from './model'
import { BBoxDrawTool } from './tools/bbox/draw'
import { PolylineDrawTool } from './tools/polyline'
import { AnnotationEditTool } from './tools/common/edit'
import { createRaster, resetZoom } from './tools/image'
import { generateId } from './utils'
import AnnotationSidebar from './AnnotationList.vue'
import Toolbar from './Toolbar.vue'
import { debounce } from 'lodash'
import './style.scss'

/**
 * @type {import('vue/types/umd').ComponentOptions}
 */
const DNImageAnnotation = {
  name: 'DNImageAnnotation',

  mixins: [AnnotationToolMixin],

  data: () => ({
    instances: new InstanceList([{ id: generateId(), annotations: [] }]),
    tools: [],
    image: null,
    showShortCut: false,
  }),

  computed: {
    instanceSpec() {
      return Object.assign(
        {
          name: '개체',
          minCount: 1,
          maxCount: 10,
          countPerAnnotationName: {},
        },
        this.widgets?.instanceSpec || {}
      )
    },

    instanceName() {
      return (
        (this.context?.instanceName ||
        this.widgets?.instanceSpec?.name ||
        '개체')
      )
    },

    handleSize() {
      return this.widgets?.handleSize || 10
    },

    tagFontSize() {
      return this.widgets?.tagFontSize || 18
    },
  },

  watch: {
    /** result가 변경될 때마다 서버에 result 저장 */
    result: {
      deep: true,
      handler(result) {
        if (this.loading || !result.instances) return

        this._storeResult()
      },
    },

    /** skip 체크/해제할 때마다 tags 업데이트 후 서버에 저장 */
    skip: {
      deep: true,
      handler(skip) {
        this.tags = skip.checked ? skip.value : ''

        if (this.loading) return

        this._storeResult()
      },
    },

    /** 검수/모니터링 시 서버에 저장된 result로 작업도구를 초기화함 */
    storedResult() {
      const { loading, isReviewer, isMonitoring } = this

      const reviewOrMonitor = loading && (isReviewer || isMonitoring)

      if (reviewOrMonitor) this.init()
    },

    /** 작업 시 사진 띄우기 & 기존에 하던 작업 가져오기 */
    context: {
      deep: true,
      handler() {
        console.log('context')
        this.init()
      },
    },
  },

  methods: {
    // ==================
    // 작업 제출 전 검증 파트
    // ==================

    validator() {
      return this.validateInstances()
    },

    /**
     * 각 Instance마다 할당된 annotation 개수가 정확한지 확인
     */
    validateInstances() {
      const minInstanceCount =
        this.instances.count >= this.instanceSpec.minCount
      const countPerAnnotationName = this.instanceSpec.countPerAnnotationName

      const isAnnotationCountsSame = this.instances.list.every((
        /**@type {Instance}*/ instance
      ) => {
        const annotationCountMap = instance.countsPerAnnotationName

        const isCountSame = Object.entries(countPerAnnotationName).every(
          ([name, count]) => annotationCountMap[name] === count
        )

        return isCountSame
      })

      const labelSelected =
        !this.instanceSpec.metaLabels ||
        this.instances.list.every(i => !!i.metaLabel)

      return minInstanceCount && isAnnotationCountsSame && labelSelected
    },

    // ====================
    // 서버와 상호작용하는 부분
    // ====================

    /** 서버에 result 저장하기 */
    _storeResult() {
      this._store().catch(err => console.warn(err.message))
    },

    /**
     * 폴리라인을 JSON으로 변환 후 `result`로 설정
     *
     * vue watch가 result 변경 시 `_storeResult`를 작동시킴
     */
    _setResult() {
      this.result = this.serializeResult()
    },

    /** 폴리라인 생성, 수정, 삭제 시 실행됨 */
    onAnnotationChange() {
      this.reoderItem()
      this._setResult()
    },

    /** 폴리라인 생성, 수정, 삭제가 잦은 경우 디바운싱해서 실행됨 */
    onAnnotationChangeDebounce: debounce(function() {
      this.onAnnotationChange()
    }, 300),

    // ================
    // 작업도구 초기화 부분
    // ================

    /**
     * 로딩 끝나고 필요한 정보가 불러와진 후 실행됨
     *
     * 저장된 폴리라인과 이미지를 화면에 띄우고 폴리라인 생성/수정 툴을 초기화함
     */
    init() {
      this.initialize()

      // 기존 path, image 그림 제거
      paper.project.activeLayer.clear()

      // paper 전역 설정
      paper.settings.handleSize = this.handleSize
      paper.settings.tagFontSize = this.tagFontSize

      // 기존 어노테이션 제거
      this.instances = new InstanceList([], this.instanceSpec)
      this.instances.addInstance()

      // widgets의 spec에 따라 폴리라인 툴 생성
      this.initTools()

      // task context 이미지 화면에 그리기
      if (this.context.url)
        createRaster(this.context.url)
          .then(image => (this.image = image))
          .catch(() =>
            this.$dnAlert?.show({
              message: '이미지를 불러오는데 실패했습니다.',
              useDeny: false,
            })
          )

      // 저장된 어노테이션 역직렬화해서 폴리라인을 화면에 그리기
      this.deserializeResult(this.storedResult)

      // 검수 모드에서 모든 어노테이션 선택된 상태로 둬서 폴리라인의 인덱스 보여주기
      if (this.isReviewer) this.instances.selectAllInstance()

      // tag가 있는 경우 스킵 체크
      this.skip.checked = this.storedTags === this.skip.value
    },

    /**
     * `AnnotationSpec`에 따라 도구 생성
     *
     * `this.tools`는 [`생성툴1`, `생성툴2`, ..., `수정툴`]로 구성
     */
    initTools() {
      // 작업 제출 후 새 작업 수령 후 도구 초기화
      this.tools.forEach(tool => tool.remove())
      this.tools = []

      /** @type {import('./model').AnnotationSpec[]} */
      const annotationSpecs = this.widgets.annotationSpecs
      const drawTools = annotationSpecs.map(spec => {
        if (spec.type === 'bbox') return new BBoxDrawTool(spec)
        if (spec.type === 'polyline') return new PolylineDrawTool(spec)
        throw new Error('해당하는 도구가 없습니다.')
      })
      drawTools.forEach(tool => {
        tool.setOnDrawHandler(path => this.onDraw(tool.spec, path))
        tool.deactivate()
      })

      const editTool = new AnnotationEditTool()
      editTool.setOnEditHandler(() => this.onEdit())
      editTool.activate()

      this.tools = [...drawTools, editTool]
    },

    /**
     * `PolylineDrawTool`에서 생성이 완료된 폴리라인을 받아서 `InstanceList`에 추가
     *
     * @param {import('./model').AnnotationSpec} spec
     * @param {Path | Rectangular} item
     */
    onDraw(spec, item) {
      const id = item.id
      const type = spec.type
      const bbox = type === 'bbox' ? item : null
      const polyline = type === 'polyline' ? item : null
      const annotation = new Annotation({
        id,
        spec,
        type,
        name: spec.name,
        bbox,
        polyline,
      })

      this.instances.addAnnotation(annotation)
      this.activateTool(this.tools.length - 1)
      this.onAnnotationChange()

      // 새로 그려진 박스는 폴리라인을 가려서 선택을 막으므로 크기 정렬을 하는데
      // 이 과정에서 새로 그려진 박스의 selected가 해제됨
      // 레이블 선택을 쉽게하기 위해 다시 selected 표시함
      if (bbox) {
        paper.project.activeLayer.selected = false
        bbox.selected = true
      }
    },

    /**
     * `PolylineEditTool`에서 수정이 완료됐을 때 실행
     */
    onEdit() {
      this.onAnnotationChangeDebounce()
    },

    /**
     * 로컬에 있는 `instances`를 서버에 저장가능한 `result`로 변환
     */
    serializeResult() {
      const instances = this.instances.export()
      return { instances }
    },

    /**
     * 서버에 저장된 `result`를 Paper 객체가 포함된 `instances`로 변환
     */
    deserializeResult(result) {
      if (result.instances)
        this.instances = new InstanceList(result.instances, this.instanceSpec)

      this.onAnnotationChange()
    },

    // ========================
    // 작업도구와 유저의 상호작용 부분
    // ========================

    /**
     * `Delete`나 `Backspace` 키가 눌리면 선택되어 있는 폴리라인을 제거합니다.
     *
     * @param {KeyboardEvent} event
     */
    onKeyDown(event) {
      if (this.isSubmitting()) return

      const key = event.key.toLowerCase()
      if (key === 'delete' || key === 'backspace' || key === 't') {
        event.preventDefault()
        return this.deleteSelectedAnnotation()
      } else if (/^\d$/.test(key)) {
        return this.activateTool(+key - 1)
      } else if (key === 'escape' || key === 'm') {
        return (paper.project.activeLayer.selected = false)
      } else if (key === 'a') {
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault()
          return this.instances.selectAllInstance()
        }
        return this.addInstance()
      } else if (key === '`') {
        return (this.instances.visible = false)
      } else if (key === 'q') {
        return (this.instances.visible = !this.instances.visible)
      } else if (key === 'w') {
        if (event.shiftKey) return // 보임 선택창 단축키와의 혼선 방지
        return this.instances.selectUpInstance()
      } else if (key === 's') {
        if (event.shiftKey) return // 보임 선택창 단축키와의 혼선 방지
        return this.instances.selectDownInstance()
      } else if (key === 'g') {
        return this.deleteInstance(this.instances.selectedInstance)
      } else if (key === 'v') {
        return this.toggleInstance(this.instances.selectedInstance)
      } else if (key === 'c') {
        return event.shiftKey
          ? this.collapseInstanceList()
          : this.collapseInstance(this.instances.selectedInstance)
      } else if (key === 'e') {
        return this.selectInstance(this.instances.selectedInstance)
      } else if (key === 'f') {
        return this.resetZoom()
      } else if (key === 'd' || key === 'b') {
        return this.instances.showOnlySelected()
      } else if (key === ',' || key === '<') {
        return this.instances.reviewPrev()
      } else if (key === '.' || key === '>') {
        return this.instances.reviewNext()
      }
    },

    /**
     * `Delete`나 `Backspace` 키가 눌리면 선택되어 있는 폴리라인을 제거합니다.
     *
     * @param {KeyboardEvent} event
     */
    onKeyUp(event) {
      const key = event.key.toLowerCase()
      if (key === '`') {
        this.instances.visible = true
      }
    },

    /** 해당하는 인덱스에 저장된 툴을 활성화하고 나머지는 비활성화함 */
    activateTool(toolIdx) {
      const targetTool = this.tools[toolIdx]

      if (!targetTool || targetTool.active) return

      this.tools.forEach(tool => tool.deactivate())
      targetTool.activate()
    },

    /** `delete`, `backspace`, `t` 키 클릭 시 선택되어 있는 BBox or 폴리라인 삭제 */
    deleteSelectedAnnotation() {
      const items = paper.project.getItems({ selected: true })

      items.forEach(item => {
        if (this.instances.hasItem(item)) {
          this.instances.removeAnnotationByItem(item)
        }
      })

      // 삭제 됐으니 서버에 결과 동기화
      if (items.length) this.onAnnotationChange()
    },

    resetZoom() {
      if (!this.image) return
      resetZoom(this.image.size)
    },

    /** 어노테이션을 추가할 수 있는 인스턴스 추가 생성 */
    addInstance() {
      if (this.instances.count >= this.instanceSpec.maxCount) return

      this.instances.addInstance()

      this.onAnnotationChange()
    },

    /**
     * 현재 선택된 어노테이션을 클릭한 인스턴스에 추가함
     *
     * @param {Instance} targetInstance
     */
    selectInstance(targetInstance) {
      this.instances.selectInstance(targetInstance)

      const items = paper.project.getItems({ selected: true })

      items.forEach(item => {
        if (this.instances.hasItem(item)) {
          this.instances.moveAnnotationByItem(item, targetInstance)
        }
      })

      if (items.length) this.onAnnotationChange()
    },

    /**
     * `InstanceList`에서 `Instance` 제거
     *
     * @param {Instance} instance
     */
    deleteInstance(instance) {
      this.instances.removeInstance(instance)
      this.onAnnotationChange()
    },

    /**
     * `Instance`의 Visibility를 토글합니다.
     *
     * @param {Instance} instance
     */
    toggleInstance(instance) {
      instance.visible = !instance.visible
    },

    /**
     * `Instance`의 `collapsed`를 토글합니다.
     *
     * @param {Instance} instance
     */
    collapseInstance(instance) {
      instance.toggleCollapse()
    },

    collapseInstanceList() {
      this.instances.toggleCollapse()
    },

    /**
     * `AnnotationList`와 `InstanceList`에서 `annotation` 제거
     *
     * @param {Annotation} annotation
     */
    deleteAnnotation(annotation) {
      this.instances.removeAnnotation(annotation)
      this.onAnnotationChange()
    },

    /**
     * Annotation의 Visibility를 토글합니다.
     *
     * @param {Annotation} annotation
     */
    toggleAnnotation(annotation) {
      annotation.item.visible = !annotation.item.visible
      annotation.item.selected = false
    },

    // ========================
    // 작업도구 유틸 함수 부분
    // ========================

    /**
     * Item의 크기에 따라 캔버스 내 배치 순서를 조절
     *
     * 새로 추가된 박스가 폴리라인 앞에 있으면 폴리라인 선택이 안 됨
     * 크기가 큰 Item을 뒤에 둬서 모든 요소를 선택하기 쉽게하기 위해 Item 순서를 정렬함
     */
    reoderItem() {
      const labeledItems = this.instances.instances.flatMap(instance =>
        instance.annotations.flatMap(a => a.item)
      )
      /** @type {(Rectangular | Path)[]} */
      const items = labeledItems.sort((item1, item2) => {
        const area1 = item1 instanceof Rectangular ? item1.area : 0
        const area2 = item2 instanceof Rectangular ? item2.area : 0
        return area2 - area1
      })

      const existingItem = paper.project.activeLayer.children.slice(1)
      const orderChanged = existingItem.some(
        (item, idx) => item !== items?.[idx]
      )
      if (orderChanged)
        items.forEach(item => paper.project.activeLayer.addChild(item))
    },

    /** 제출하기 버튼을 눌러서 모달이 떠있는지 확인 */
    isSubmitting() {
      return !!document.querySelector('.submit-modal.visible')
    },
  },

  created() {
    this._setConfig({ noEditByReviewMode: false })

    this._setSkip({
      use: false,
      message: '레이블할 영역이 없습니다.',
      value: 'bad-data',
    })
  },

  mounted() {
    /** @type {HTMLCanvasElement} */
    const canvas = this.$refs.canvas
    paper.setup(canvas)

    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)

    if (this.context) this.init()
  },

  beforeDestroy() {
    paper.remove()

    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  },

  components: { AnnotationSidebar, Toolbar },

  render(h) {
    const { title, progress, hasRejectReason, config, loading } = this

    return (
      <dn-annotation-layout-type-a
        id="dn-image-annotation"
        title={title}
        progress={progress}
        has-reject-reason={hasRejectReason}
        config={config}
        style="overflow: hidden;"
      >
        {...renderDescriptionsAndInstructionDetail(h, this.$slots.default)}
        <template slot="main">
          <dn-ui-segment
            style={{ height: '100%' }}
            loading={loading}
            no-padding
          >
            <canvas
              ref="canvas"
              style={{ width: '100%', height: '99%', outline: 0 }}
            />

            <div
              onMouseenter={() => (this.showShortCut = true)}
              onMouseleave={() => (this.showShortCut = false)}
            >
              <dn-ui-button class="fab left">
                <dn-ui-icon name="help" />
              </dn-ui-button>
              {this.showShortCut ? (
                <div class="shortcut-img">
                  <img src="https://user-images.githubusercontent.com/22253556/103050977-08a23500-45d9-11eb-8bf7-570399c0a688.png" />
                </div>
              ) : null}
            </div>

            <dn-ui-button onClick={this.resetZoom} class="fab">
              <dn-ui-icon name="fitimg" />
            </dn-ui-button>
          </dn-ui-segment>
        </template>

        <template slot="right-side">
          <dn-ui-segment no-padding style={{ height: '100%' }}>
            <annotation-sidebar
              instanceName={this.instanceName}
              instances={this.instances}
              onInstanceAdd={this.addInstance}
              onInstanceSelect={this.selectInstance}
              onInstanceDelete={this.deleteInstance}
              onInstanceToggle={this.toggleInstance}
              onInstanceCollapse={this.collapseInstance}
              onAnnotationDelete={this.deleteAnnotation}
              onAnnotationToggle={this.toggleAnnotation}
              onMetaLabelSelect={this.onAnnotationChange}
              onInstanceListCollapse={this.collapseInstanceList}
            />
          </dn-ui-segment>
        </template>

        <template slot="toolbar">
          <toolbar tools={this.tools} activateTool={this.activateTool} />
        </template>
      </dn-annotation-layout-type-a>
    )
  },
}

export default DNImageAnnotation
