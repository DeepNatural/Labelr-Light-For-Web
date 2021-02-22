import { paper, Raster, Point, Size } from '@/utils/Paper'

/**
 *
 * @param {HTMLImageElement} obj
 * @return {Promise<HTMLImageElement>}
 */
function onloadImage(obj) {
  return new Promise((resolve, reject) => {
    obj.onload = () => resolve(obj)
    obj.onerror = reject
  })
}

/**
 *
 * @param {string} imageUrl
 */
export async function createRaster(imageUrl) {
  const raster = new Raster(imageUrl)

  await onloadImage(raster)

  const center = new Point(raster.size.width / 2, raster.size.height / 2)
  raster.position = center
  raster.locked = true
  paper.view.center = center

  resetZoom(raster.size)

  return raster
}

const IMAGE_PADDING = 50

/**
 * 이미지를 화면 크기에 맞게 확대함
 *
 * @param {Size} size
 */
export function resetZoom(size) {
  const viewSize = paper.view.size
  const center = new Point(size.width / 2, size.height / 2)
  const zoom = Math.min(
    viewSize.width / (size.width + IMAGE_PADDING),
    viewSize.height / (size.height + IMAGE_PADDING),
    1
  )
  paper.view.center = center
  paper.view.zoom = zoom
}
