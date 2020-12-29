import { isValid } from '@/utils/isValid'

class Transition {
  duration = .05
  timingFunction = 'ease-in'
}

class ProgressBarProps {
  /**
   * @typedef TypeProgressBarProps
   * @prop {number | string} value
   * @prop {Transition} transition
   * 
   * @returns {TypeProgressBarProps}
   */
  static toScheme() {
    return {
      value: {
        type: [ Number, String ],
        default: 0
      },

      transition: {
        type: Object,
        default: () => new Transition
      }
    }
  }
}

/**
 * @type {import('vue/types/umd').Component}
 */
const ProgressBar = {
  name: 'DNProgressBar',

  functional: true,

  model: {
    prop: 'value'
  },

  props: ProgressBarProps.toScheme(),

  /**
   * @param {import('vue/types/umd').CreateElement} h
   * @param {import('vue/types/umd').RenderContext<TypeProgressBarProps>} options
   */
  render(h, { data, props: { value, transition }, listeners }) {
    const onClick = ({ offsetX, currentTarget: { offsetWidth } }) => {
      if(typeof listeners.click === 'function') {
        listeners.click(offsetX / offsetWidth * 100)
      }
    }

    return h(
      'div',
      {
        on: { click: onClick },
        staticClass: 'dn-progress-bar',
        class: data.class
      },
      [
        h(
          'div',
          { staticClass: 'progress-bar-background' },
          [
            h(
              'div',
              {
                staticClass: 'progress-bar-value',
                style: {
                  transform: `translateX(calc(${isValid.string(value) ? value : Math.min(value, 100)}% - 100%))`,
                  transitionDuration: `${transition.duration}s`,
                  transitionTimingFunction: transition.timingFunction,
                }
              }
            )
          ]
        )
      ]
    )
  }
}

export default ProgressBar
