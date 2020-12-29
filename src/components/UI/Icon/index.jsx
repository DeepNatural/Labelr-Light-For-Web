import { merge } from '@/utils/merge'

class IconProps {
  static toScheme() {
    return {
      type: {
        type: String,
        default: 'assetIcons',
      },
      name: String,
      size: {
        type: [Number, String],
        default: 24,
      },
      theme: {
        type: String,
        default: undefined,
      },
    }
  }
}

/**
 * @type {import('vue/types/umd').Component}
 */
const Icon = {
  name: 'DNIcon',

  functional: true,

  props: IconProps.toScheme(),

  /**
   * @param {import('vue/types/umd').CreateElement} h
   */
  render(h, { props: { type, name, size, theme }, data }) {
    switch (type) {
      case 'assetIcons': {
        return (
          <div
            style={{
              width: `${size}px`,
              height: `${size}px`,
              ...merge(data.style, data.staticStyle),
            }}
            class="dn-icon"
          >
            {/* styles/common.scss 에 day, night 스타일 정의 */}
            {theme === 'night' ? null : (
              <img
                class={!theme ? 'day' : ''}
                src={require(`@/icons/${name}.svg`)}
                style={{
                  width: `${size}px`,
                  ...merge(data.style, data.staticStyle),
                }}
              />
            )}
            {theme === 'day' ? null : (
              <img
                class={!theme ? 'night' : ''}
                src={require(`@/icons/${name}-w.svg`)}
                style={{
                  width: `${size}px`,
                  ...merge(data.style, data.staticStyle),
                }}
              />
            )}
          </div>
        )
      }
      case 'simple-line-icons':
        return (
          <i
            class={`icon-${name} icons`}
            style={{
              fontSize: `${Math.max(Number(size) - 8, 12)}px`,
              ...merge(data.style, data.staticStyle),
            }}
          ></i>
        )
      case 'material':
        return (
          <i
            class="material-icons"
            style={{
              fontSize: `${Math.max(Number(size) - 8, 12)}px`,
              ...merge(data.style, data.staticStyle),
            }}
          >
            {name}
          </i>
        )
    }
  },
}

export default Icon
