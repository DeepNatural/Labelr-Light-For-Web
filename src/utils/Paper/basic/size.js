export class Size {
  constructor(width = 0, height = 0) {
    this.width = width
    this.height = height
  }

  clone() {
    return new Size(this.width, this.height)
  }

  get values() {
    return [this.width, this.height]
  }

  get isZero() {
    return this.width === 0 && this.height === 0
  }

  /** @param {Size | number} size*/
  equals(size) {
    return this.width === size.width && this.height === size.height
  }

  /** @param {Size | number} size*/
  add(size) {
    if (size instanceof Size)
      return new Size(this.width + size.width, this.height + size.height)
    else return new Size(this.width + size, this.height + size)
  }

  /** @param {Size | number} size*/
  subtract(size) {
    if (size instanceof Size)
      return new Size(this.width - size.width, this.height - size.height)
    else return new Size(this.width - size, this.height - size)
  }

  /** @param {Size | number} size*/
  multiply(size) {
    if (size instanceof Size)
      return new Size(this.width * size.width, this.height * size.height)
    else return new Size(this.width * size, this.height * size)
  }

  /** @param {Size | number} size*/
  divide(size) {
    if (size instanceof Size)
      return new Size(this.width / size.width, this.height / size.height)
    else return new Size(this.width / size, this.height / size)
  }

  /** @param {Size | number} size*/
  modulo(size) {
    if (size instanceof Size)
      return new Size(this.width % size.width, this.height % size.height)
    else return new Size(this.width % size, this.height % size)
  }
}
