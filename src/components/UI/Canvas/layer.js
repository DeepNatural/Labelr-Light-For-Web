import { generateUniqueId } from '@/utils'
import Subject from './subject'
import { CanvasScale } from './container'

/**
 * @class
 * Canvas 의 레이어
 */
export default class Layer {
  /** 레이어 아이디 */
  id = ''

  /**
   * @type {Subject[]}
   * 레이어에 포함된 `Subject` 리스트
   */
  subjects = []

  /**
   * @type {Subject}
   * 페인트 계열 Tool(Box, Polygon, Point, Line)을 사용하는 `Subject`
   */
  _paintingSubject = null

  /** 레이어 표시 여부 */
  visible = true

  constructor() {
    this.id = generateUniqueId()
  }

  /**
   * @return {CanvasRenderingContext2D}
   */
  getCtx() {
    return this._ctx
  }

  /**
   * @return {CanvasScale}
   */
  getScale() {
    return this._scale
  }

  get paintingSubject() {
    return this._paintingSubject
  }

  set paintingSubject(subject) {
    if (!(this._paintingSubject instanceof Subject)) {
      this.injectLayerInSubject(subject)
    }

    this._paintingSubject = subject
  }

  /** 선택된 `Subject` */
  get selectedSubject() {
    return this.subjects.filter(subject => subject.isSelected)[0]
  }

  /** 움켜쥔 `Subject` */
  get grabbedSubject() {
    return this.subjects.filter(subject => subject.isGrabbed)[0]
  }

  /**
   * @param {Subject} subject 
   */
  injectLayerInSubject(subject) {
    if (!subject.getLayer()) {
      Object.defineProperties(subject, {
        _layer: {
          enumerable: false,
          configurable: false,
          get: () => this
        }
      })
    }
  }

  /**
   * Subject 추가하기
   * @param {Subject} subject 
   * @param {number} index
   */
  addSubject(subject, index) {
    this.injectLayerInSubject(subject)

    if(index >= 0) {
      this.subjects = [
        ...this.subjects.slice(0, index),
        subject,
        ...this.subjects.slice(index)
      ]
    } else {
      this.subjects.push(subject)
    }
  }

  /**
   * Subject 삭제하기
   * @param {number} index
   */
  removeSubject(index) {
    this.subjects.splice(index, 1)
  }

  /** 레이어의 모든 `Subject` 지우기 */
  clear() {
    this.subjects = []
  }

  /**
   * 모든 `Subject` 선택 해제 및 움켜쥔것 풀기
   * @param {boolean?} isReleaseGrab `true` 라면 `isGrabbed` 까지 해제
   */
  releaseAllSubjects(isReleaseGrab = false) {
    this.subjects.forEach(subject => {
      subject.isSelected = false
      if(isReleaseGrab) subject.isGrabbed = false
    })
  }
}
