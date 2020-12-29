import * as types from './types'
import { EventEmitter } from 'events'

const Types = { ...types }

export class DNEventEmitter extends EventEmitter {
  static instance

  constructor() {
    super()

    !DNEventEmitter.instance && (DNEventEmitter.instance = this)

    return DNEventEmitter.instance
  }

  get types() { return Types }
}

const emitter = new DNEventEmitter

emitter.setMaxListeners(0)

export default emitter
