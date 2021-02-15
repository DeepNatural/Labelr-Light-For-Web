import RGBA from '@/utils/rgba'

export class Color extends RGBA {
  static random() {
    const rand = Math.round(0xffffff * Math.random())
    const [r, g, b] = [rand >> 16, (rand >> 8) & 255, rand & 255]
    return new Color(r, g, b)
  }
}
