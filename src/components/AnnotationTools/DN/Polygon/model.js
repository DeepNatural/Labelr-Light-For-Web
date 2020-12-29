export class Polygon {
  name = ''

  index = -1

  /**
   * @type {number[][]}
   */
  points = []

  /**
   * @param {{ name: string, index: number, points: number[][] }}
   */
  constructor({ name, index, points }) {
    this.name = name
    this.index = index
    this.points = points
  }

  toJSON() {
    return {
      name: this.name,
      index: this.index,
      points: this.points
    }
  }
}

export default class RawData {
  id = 0
  url = ''

  /**
   * @private
   * @type {{[name: string]: Polygon[]}}
   * @example ```
   * { "Cat": [Polygon, Polygon, ..., Polygon], "Dog": [Polygon, Polygon, ..., Polygon] }
   * ```
   */
  _polygons = {}

  /**
   * @param {{ id: number | string, url: string, polygons: { name: string, index: number, points: number[][] }[]}}
   */
  constructor({ id, url, polygons = [] }) {
    this.id = id
    this.url = url

    polygons.forEach(p => this.insertPolygon(p))
  }

  get polygons() {
    /** @type {Polygon[]} */
    let polygons = []

    Object.entries(this._polygons)
      .forEach(([,_polygons]) => {
        polygons = polygons.concat(_polygons)
      })

    return polygons
  }

  /**
   * @param {Polygon} polygon
   */
  insertPolygon(polygon) {
    return this.addPolygonAt({ polygon })
  }

  /**
   * @param {{ index: number, polygon: Polygon }} 
   */
  addPolygonAt({ index, polygon }) {
    const _polygons = this._polygons
    const name = polygon.name

    !_polygons[name] && (_polygons[name] = [])
    
    const polygons = _polygons[name]
    const _index = index ?? polygons.length
    const newPolygon = new Polygon({ ...polygon, index: _index })

    if(polygons[_index]) {
      console.warn(`${name} 의 ${index} 번째 에는 이미 Polygon 이 있습니다.`)
    }

    _polygons[name] = [
      ...polygons.slice(0, _index),
      newPolygon,
      ...polygons.slice(_index)
    ]

    this._polygons = {
      ...this._polygons
    }

    console.debug(`[Polygon][addPolygonAt]: name: ${name}, index: ${index}`)

    return newPolygon
  }

  /**
   * @param {string} name 
   * @param {number} index
   */
  removePolygonByNameAndIndex(name, index) {
    const polygons = this._polygons[name]

    polygons.splice(index, 1)
    polygons.forEach((p, i) => p.index = i)

    this._polygons[name] = polygons

    console.debug(`[Polygon][removePolygonByNameAndIndex]: name: ${name}, index: ${index}`)
  }

  /**
   * @param {string} name 
   * @param {number} index 
   * @param {Polygon} polygon 
   */
  updatePolygon(name, index, polygon) {
    const _polygons = this._polygons
    const beforePolygon = _polygons[name][index]
    let result = null

    if(beforePolygon instanceof Polygon) {
      if(beforePolygon.name === polygon.name) {
        beforePolygon.points = polygon.points
        result = beforePolygon
      } else {
        this.removePolygonByNameAndIndex(name, index)
        result = this.insertPolygon(polygon)
      }
    }

    console.debug(`[Polygon][updatePolygon]: name: ${name}, index: ${index}`)
    
    return result
  }

  toJSON() {
    return this.polygons
      .map(p => p.toJSON())
      .sort((a, b) => a.name.localeCompare(b.name))
  }
}
