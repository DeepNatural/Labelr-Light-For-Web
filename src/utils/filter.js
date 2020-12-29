import { isValid } from './isValid'

/**
 * @param {import('vue/types/umd').VNode} V
 * @returns {false | string}
 */
export const filterFuntionalComponents = V => isValid.object(V.fnOptions) && V.fnOptions.name

/**
 * @param {import('vue/types/umd').VNode} V
 * @param {string} cName
 */
export const filterByComponentName = (V, cName) => filterFuntionalComponents(V) === cName

/** @param {import('vue/types/umd').VNode} V */
export const filterIntroduction = V => filterByComponentName(V, 'DNInstruction')

/** @param {import('vue/types/umd').VNode} VNode */
export const filterDescription = V => filterByComponentName(V, 'DNDescription')
