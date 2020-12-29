import _ from 'lodash'
import { filterDescription, filterIntroduction } from './filter'

/**
 * @param {boolean} isMain
 * @return {(VNode: import('vue/types/umd').VNode) => boolean}
 */
const classifyDescription = (is = false) => V => V.data.props.main === is

/** @param {import('vue/types/umd').VNode[]} slots */
const classifyComponents = slots => {
  /** @type {{ main: import('vue/types/umd').VNode[], subs: import('vue/types/umd').VNode[] }} */
  const desc = { main: [], subs: [] }

  /** @type {import('vue/types/umd').VNode[]} */
  const instruction = []

  slots.forEach(V => {
    if(filterDescription(V)) {
      if(classifyDescription(true)(V)) {
        desc.main.push(V)
      } else {
        desc.subs.push(V)
      }
    } else if(filterIntroduction(V)) {
      instruction.push(V)
    }
  })

  return [ desc, instruction ]
}

/**
 * @param {import('vue/types/umd').CreateElement} h
 */
const renderMainDesc = h => _.partial(renderSlot, h, 'main-description')

/**
 * @param {import('vue/types/umd').CreateElement} h
 */
const renderSubDesc = h => _.partial(renderSlot, h, 'descriptions')

/**
 * @param {import('vue/types/umd').CreateElement} h
 */
const renderInstructionDetail = h => _.partial(renderSlot, h, 'instructionDetail')

/**
 * @param {import('vue/types/umd').CreateElement} h
 * @param {string} slotName
 * @param {import('vue/types/umd').VNode[]} V
 */
export const renderSlot = (h, slotName, V) => h('template', { slot: slotName }, V)

export const renderDescriptionsAndInstructionDetail = (h, slots) => {
  const [ { main, subs }, instruction ] = classifyComponents(slots)

  return [
    renderMainDesc(h)(main),
    renderSubDesc(h)(subs),
    renderInstructionDetail(h)(instruction)
  ]
}
