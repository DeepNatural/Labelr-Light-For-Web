import paper, { Path, Point, Rectangle, Rectangular } from '@/utils/Paper'
import { deserializeAnnotation, generateId, zoomBounds } from './utils'

/** @typedef {'polyline' | 'bbox'} ToolType */

/**
 * @typedef InstanceSpec
 * @property {string} name
 * @property {number} minCount
 * @property {number} maxCount
 * @property {Record<string, number>} countPerAnnotationName
 * @property {string[]} metaLabels
 */

/**
 * @typedef CrosslineStyle
 * @property {number} strokeWidth
 * @property {string} color
 * @property {number[]} dashed
 */

/**
 * @typedef AnnotationSpec
 * @property {ToolType} type
 * @property {string} name
 * @property {string} icon
 * @property {number} length
 * @property {number} strokeWidth
 * @property {number} count
 * @property {number} minCount
 * @property {number} minHeight
 * @property {number} minWidth
 * @property {string} color
 * @property {string} handleFillColor
 * @property {string} handleFontColor
 * @property {boolean} crossline
 * @property {CrosslineStyle} crosslineStyle
 */

/**
 * @typedef StoredInstance
 * @property {string} id
 * @property {StoredAnnotation[]} annotations
 * @property {string} metaLabel
 */

/**
 * @typedef StoredAnnotation
 * @property {string} id
 * @property {ToolType} type
 * @property {string} name
 * @property {AnnotationSpec} spec
 * @property {{ x: number, y: number }[]} polyline
 * @property {{ x: number, y: number, width: number, height: number }} bbox
 */

/**
 * @typedef ParsedAnnotation
 * @property {string} id
 * @property {ToolType} type
 * @property {string} name
 * @property {AnnotationSpec} spec
 * @property {Path} polyline
 * @property {Rectangular} bbox
 */
export class Annotation {
  /** @param {StoredAnnotation} annotation */
  constructor(annotation) {
    const { id, name, type, spec, bbox, polyline } = deserializeAnnotation(
      annotation
    )
    this.id = id
    this.name = name
    this.type = type
    this.spec = spec
    this.bbox = bbox
    this.polyline = polyline
  }

  get item() {
    return this.bbox || this.polyline
  }

  /** @param {Path | Rectangular} item */
  hasItem(item) {
    return item.id === this.item.id
  }

  remove() {
    this.item.remove()
  }

  export() {
    const { name, spec, type, polyline, bbox } = this

    return {
      name,
      spec,
      type,
      polyline: polyline?.export(),
      bbox: bbox?.export(),
    }
  }
}

export class AnnotationList {
  /** @param {StoredAnnotation[]} annotations*/
  constructor(annotations = []) {
    this.annotations = annotations.map(annotation => new Annotation(annotation))
  }

  get list() {
    return this.annotations
  }

  get count() {
    return this.annotations.length
  }

  get isEmpty() {
    return this.count === 0
  }

  get visible() {
    return this.count === 0 || this.annotations.some(a => a.item.visible)
  }

  /** `AnnotationList` 전체 가시성 설정 */
  set visible(value) {
    this.annotations.forEach(annotation => {
      annotation.item.visible = value
    })
  }

  get countsPerAnnotationName() {
    return this.annotations.reduce((acc, annotation) => {
      acc[annotation.name] = (acc[annotation.name] || 0) + 1
      return acc
    }, {})
  }

  /** Annotation의 모든 item을 담는 바운드 반환 */
  get bounds() {
    const boundPoints = this.annotations.flatMap(a => a.item.bounds.corners)
    if (boundPoints.length === 0) return null
    const xs = boundPoints.map(point => point.x)
    const ys = boundPoints.map(point => point.y)
    const { min, max } = Math
    const [minX, minY, maxX, maxY] = [
      min(...xs),
      min(...ys),
      max(...xs),
      max(...ys),
    ]
    return new Rectangle(new Point(minX, minY), new Point(maxX, maxY))
  }

  /** @param {Annotation} annotation*/
  add(annotation) {
    this.annotations.push(annotation)
  }

  /** @param {Annotation} target*/
  hasAnnotation(target) {
    return !!this.annotations.find(annotation => annotation.id === target.id)
  }

  /** @param {Path | Rectangular} item */
  getByItem(item) {
    return this.annotations.find(annotaion => annotaion.hasItem(item))
  }

  /** @param {Path | Rectangular} item */
  hasItem(item) {
    return !!this.getByItem(item)
  }

  /**
   * List에서 `Annotation`을 제거하고 이를 반환합니다.
   *
   * @param {Annotation} target
   */
  pop(target) {
    const idx = this.annotations.findIndex(
      annotation => annotation.id === target.id
    )

    if (idx === -1) return null

    const [annotation] = this.annotations.splice(idx, 1)
    return annotation
  }

  /**
   * `Item`을 가지고 있는 `Annotation` 제거하고 이를 반환합니다.
   *
   * @param {Path | Rectangular} item
   */
  popByItem(item) {
    const idx = this.annotations.findIndex(
      annotation => annotation.item.id === item.id
    )

    if (idx === -1) return null

    const [annotation] = this.annotations.splice(idx, 1)
    return annotation
  }

  /**
   * List에 있는 `Annotation`을 파괴합니다.
   *
   * @param {Annotation} annotation
   */
  remove(annotation) {
    this.pop(annotation)?.remove()
  }

  /**
   * List에 있는 모든 `Annotation`을 파괴합니다.
   *
   */
  removeAll() {
    this.annotations.forEach(a => a.remove())
    this.annotations = []
  }

  /**
   * `item`을 가진 `Annotation`을 파괴합니다.
   *
   * @param {Path | Rectangular} item
   */
  removeByItem(item) {
    this.popByItem(item)?.remove()
  }

  /**
   * 모든 어노테이션 항목을 `selected` 처리합니다.
   */
  selectAllItems() {
    this.annotations.forEach(ann => (ann.item.selected = true))
  }

  export() {
    return this.annotations.map(a => a.export())
  }
}

export class Instance extends AnnotationList {
  /**
   * @param {StoredInstance} instance
   * @param {InstanceSpec} spec
   */
  constructor(instance, spec) {
    super(instance.annotations)
    this.id = instance.id
    this._metaLabel = instance.metaLabel
    this.collapsed = false
    this.spec = spec
    this.index = -1
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed
  }

  get validationMsg() {
    const [exceeded, needed] = Object.keys(
      this.spec.countPerAnnotationName
    ).reduce(
      (acc, name) => {
        const annotated = this.countsPerAnnotationName[name] || 0
        const toAnnotate = this.spec.countPerAnnotationName[name]

        if (annotated === toAnnotate) return acc
        if (annotated > toAnnotate) return acc[0].push(name), acc
        if (annotated < toAnnotate) return acc[1].push(name), acc
      },
      [[], []]
    )

    const exceedMsg = exceeded.length ? `${exceeded.join(', ')} 개수 초과` : ''
    const needMsg = needed.length ? `${needed.join(', ')} 필요` : ''
    const msg = [exceedMsg, needMsg].join(' ')
    return msg
  }

  /** @param {Annotation} annotation*/
  add(annotation) {
    this.annotations.push(annotation)
  }

  /**
   * 인스턴스 리스트 내 인덱스 수동 설정용
   * @param {number} index
   */
  setIndex(index) {
    this.index = index
  }

  export() {
    const { id, metaLabel } = this

    return {
      id,
      annotations: super.export(),
      metaLabel,
    }
  }
}

export class InstanceList {
  /**
   * @param {StoredInstance[]} instances
   * @param {InstanceSpec} spec
   */
  constructor(instances = [], spec = {}) {
    this.spec = Object.assign(
      {
        name: '개체',
        minCount: 1,
        maxCount: 10,
        countPerAnnotationName: {},
      },
      spec
    )

    this.instances = instances.map(
      instance => new Instance(instance, this.spec)
    )
    this.instances.forEach((instance, index) => instance.setIndex(index))
    this.selectedIndex = 0
  }

  get list() {
    return this.instances
  }

  get count() {
    return this.instances.length
  }

  get selectedInstance() {
    return this.instances[this.selectedIndex]
  }

  /** `InstanceList` 전체 가시성 */
  get visible() {
    return this.instances.every(instance => instance.visible)
  }

  set visible(value) {
    this.instances.forEach(instance => (instance.visible = value))
  }

  /** `InstanceList` 레이블 열고 닫기 여부 */
  get collapsed() {
    return this.instances.every(instance => instance.collapsed)
  }

  set collapsed(value) {
    this.instances.forEach(instance => (instance.collapsed = value))
  }

  /** 새로운 `Instance` 추가 */
  addInstance() {
    this.instances.push(
      new Instance(
        {
          id: generateId(),
          annotations: [],
          metaLabel: this.spec?.metaLabels?.[0] || null,
        },
        this.spec
      )
    )

    this.selectIndex(this.count - 1)
    this.updateInstanceIndeces()
  }

  /**
   * 리스트에서 `Instance`를 제거합니다.
   *
   * @param {Instance} instance
   */
  removeInstance(instance) {
    instance.removeAll()

    const idx = this.instances.indexOf(instance)

    if (idx !== -1) this.instances.splice(idx, 1)

    if (this.count <= 0) {
      this.addInstance()
    }

    this.selectIndex(this.selectedIndex)
    this.updateInstanceIndeces()
  }

  /**
   * List의 `Instance` 중 하나가 `item`을 가지고 있는지 확인합니다.
   *
   * @param {Path | Rectangular} item
   */
  hasItem(item) {
    return !!this.getItemContainer(item)
  }

  /**
   * `annotation`을 가지고 있는 `Instance`를 반환합니다.
   *
   * @param {Annotation} annotation
   */
  getAnnotationContainer(annotation) {
    return this.instances.find(instance => instance.hasAnnotation(annotation))
  }

  /**
   * `item`을 가지고 있는 `Instance`를 반환합니다.
   *
   * @param {Path | Rectangular} item
   */
  getItemContainer(item) {
    return this.instances.find(instance => instance.hasItem(item))
  }

  /**
   * item으로 Annotation을 가져옵니다.
   *
   * @param {Path | Rectangular} item
   */
  getAnnotationByItem(item) {
    return this.getItemContainer(item).getByItem(item)
  }

  /**
   * 선택된 `Instance`에 `annotation`을 추가합니다.
   * @param {Annotation} annotation
   */
  addAnnotation(annotation) {
    this.selectedInstance.add(annotation)
  }

  /**
   * `Instance`에서 `annotation`을 찾아서 제거합니다.
   * @param {Annotation} annotation
   */
  removeAnnotation(annotation) {
    this.getAnnotationContainer(annotation)?.remove(annotation)
    this.updateInstanceIndeces()
  }

  /**
   * `item`을 가진 `annotation`을 `Instance`에서 찾아서 제거합니다.
   *
   * @param {Path | Rectangular} item
   */
  removeAnnotationByItem(item) {
    this.getItemContainer(item)?.removeByItem(item)
    this.updateInstanceIndeces()
  }

  /**
   * `item`을 다른 인스턴스로 옮김
   * @param {Path | Rectangular} item
   * @param {Instance} to
   */
  moveAnnotationByItem(item, to) {
    const from = this.getItemContainer(item)
    if (!from || from === to) return
    to.add(from.popByItem(item))

    this.updateInstanceIndeces()
  }

  /**
   * 현재 선택된 인덱스를 설정함
   * @param {nummber} index
   */
  selectIndex(index) {
    this.selectedIndex = Math.min(Math.max(index, 0), this.count - 1)
  }

  /**
   * 인스턴스로 현재 선택된 인덱스를 설정함
   * @param {Instance} instance
   */
  selectInstance(instance) {
    this.selectIndex(this.instances.indexOf(instance))
  }

  /**
   * 현재 선택한 인스턴스 스크롤 업
   */
  selectUpInstance() {
    this.selectIndex((this.selectedIndex - 1 + this.count) % this.count)
  }

  /**
   * 현재 선택한 인스턴스 스크롤 다운
   */
  selectDownInstance() {
    this.selectIndex((this.selectedIndex + 1) % this.count)
  }

  /**
   * 현재 선택된 인스턴스만 보여줍니다.
   */
  showOnlySelected() {
    this.visible = false
    this.selectedInstance.visible = true
    paper.project.activeLayer.selected = false
    this.selectedInstance.selectAllItems()
  }

  selectAllInstance() {
    this.instances.forEach(instance => instance.selectAllItems())
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed
  }

  updateInstanceIndeces() {
    this.instances.forEach((instance, index) => instance.setIndex(index))
  }

  reviewNext() {
    const isFirstTrigger = this.selectedIndex === 0 && this.visible
    if (!isFirstTrigger) this.selectDownInstance()
    this.showOnlySelected()
    const bounds = this.selectedInstance.bounds
    if (bounds) zoomBounds(bounds)
  }

  reviewPrev() {
    this.selectUpInstance()
    this.showOnlySelected()
    const bounds = this.selectedInstance.bounds
    if (bounds) zoomBounds(this.selectedInstance.bounds)
  }

  export() {
    return this.instances.map(instance => instance.export())
  }
}
