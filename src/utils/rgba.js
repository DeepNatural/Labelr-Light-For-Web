import { hexToDecimal } from '.'

export default class RGBA {
  static DN_COLOR_NAMES = {
    RED: { name: 'red', code: '#ff4949' },
    G_BLUE: { name: 'g-blue', code: '#00c1c6' },
    VIOLET: { name: 'violet', code: '#aa69ff' },
    BLUE: { name: 'blue', code: '#008eff' },
    ORANGE: { name: 'orange', code: '#ff9800' },
    DARK_BLUE: { name: 'dark-blue', code: '#2c2c44' },
    BLACK_BLUE: { name: 'black-blue', code: '#1f1f2f' },
    BLACK: { name: 'black', code: '#000000' },
    WHITE: { name: 'white', code: '#ffffff' },
    LIGHT_GRAY: { name: 'light-gray', code: '#dadada' },
  }

  r = 0
  g = 0
  b = 0
  alpha = 1

  /**
   * @param {RGBA | string | (number | string)[]} args
   */
  constructor(...args) {
    if(args.length >= 3) {
      const [r, g, b, alpha = 1] = args

      this.r = r
      this.g = g
      this.b = b
      this.alpha = alpha
    } else {
      if(typeof args[0] === 'string') {
        const rgba = args[0].replace(/\s/gi, '')
        const isHex = (/^#((([0-9]|[a-z]){8}|([0-9]|[a-z]){6}|([0-9]|[a-z]){4}|([0-9]|[a-z]){3})$)/g).test(rgba)
        const isRGBString = (/^(rgb|rgba)\(/).test(rgba)
  
        if(isHex) {
          const hexCodes = rgba.split('#')[1].split('')
          let r, g, b, alpha = 255
  
          if(hexCodes.length === 3 || hexCodes.length === 4) {
            const [ _r, _g, _b, _a = 'f' ] = hexCodes
  
            r = hexToDecimal(_r + _r)
            g = hexToDecimal(_g + _g)
            b = hexToDecimal(_b + _b)
            alpha = hexToDecimal(_a + _a)
          } else if(hexCodes.length === 6 || hexCodes.length === 8) {
            const [ _r1, _r2, _g1, _g2, _b1, _b2, _a1 = 'f', _a2 = 'f' ] = hexCodes
            
            r = hexToDecimal(_r1 + _r2)
            g = hexToDecimal(_g1 + _g2)
            b = hexToDecimal(_b1 + _b2)
            alpha = hexToDecimal(_a1 + _a2)
          }
  
          this.r = r
          this.g = g
          this.b = b
          this.alpha = parseFloat((alpha / 255).toFixed(2))
        } else if(isRGBString) {
          const [ r, g, b, alpha ] = args[0].match(/([0-9]{0,1}\.[0-9]{1}|[0-9]{1,})/g).map(v => Number(v.replace(',', '')))
          
          this.r = r
          this.g = g
          this.b = b
          this.alpha = alpha
        } else {
          throw new Error('16진수 코드 혹은 rgb, rgba 함수 형태여야 합니다.')
        }
      } else {
        const { r, g, b, alpha } = args[0]
  
        this.r = r
        this.g = g
        this.b = b
        this.alpha = alpha
      }
    }
  }

  toString() {
    const { r, g, b, alpha } = this

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
}
