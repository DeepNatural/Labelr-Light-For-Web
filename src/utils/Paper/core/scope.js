import { Project } from '../item'
import { Tool } from '../tool'

import { Point } from '../basic'

export class Scope {
  _class = 'Scope'

  /** @type {Project} */
  project = null

  /** @type {Project[]} */
  projects = []

  /** @type {Tool[]} */
  tools = []

  settings = {
    handleSize: 8,
  }

  get view() {
    return this.project?._view
  }

  constructor() {
    globalThis.paper = this

    this._setAgent()
  }

  _setAgent() {
    const user = globalThis.navigator.userAgent.toLocaleLowerCase()
    const os = (/(darwin|win|mac|linux|freebsd|sunos)/.exec(user) || [])[0]
    const platform = os === 'darwin' ? 'mac' : os

    this.agent = { platform }
  }

  /**
   * @param {HTMLCanvasElement} canvas
   */
  setup(canvas) {
    globalThis.paper = this

    const project = new Project(canvas)
    this.project = project
    this.projects.push(project)

    // 화면 그리기 시작
    project.view.play()

    return this
  }

  clear() {
    this.projects.forEach(project => project.remove())
    this.tools.forEach(tool => tool.remove())
    this.project = null
    this.projects = []
    this.tools = []
  }

  remove() {
    this.clear()
  }

  Point = Point
}
