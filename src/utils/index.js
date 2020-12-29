import _ from 'lodash'
import { isValid, isValidProp } from './isValid'
import RGBA from './rgba'

/**
 * @param {string} prefix 
 */
export const generateUniqueId = prefix => {
  return _.uniqueId(`${prefix ? prefix + '-' : ''}${_.random(1e14, 1e15-1).toString(16)}-`)
}

export const hexToDecimal = hex => (hex && Number(`0x${hex}`)) ?? null

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} fileName
 * @param {string} type
 * @returns {Promise<File>}
 * @description 추후 DNCanvas 로 옮겨질 예정(임시)
 */
export const canvasToImage = (canvas, fileName, type) => {
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      resolve(new File([ blob ], fileName, { type }))
    })
  })
}

export {
  isValid,
  isValidProp,
  RGBA
}
