import { isValid } from '@/utils/isValid'

class SectionHeaderProps {
  /**
   * @typedef TypeSectionHeaderProps
   * @prop {string} title
   * @prop {boolean} noUseClose
   */
  static toScheme() {
    return {
      title: String,
      noUseClose: {
        type: Boolean,
        default: false
      }
    }
  }
}

/**
 * @type {import('vue/types/umd').Component}
 */
const SectionHeader = {
  name: 'DNSectionHeader',

  functional: true,

  props: SectionHeaderProps.toScheme(),

  /**
   * @param {import('vue/types/umd').CreateElement} h
   * @param {import('vue/types/umd').RenderContext<TypeSectionHeaderProps>} context
   */
  render(h, { props: { title, noUseClose }, listeners: { clickCloseButton } }) {
    const btnCloseHandler = !isValid.function(clickCloseButton) ? () => {} : clickCloseButton

    return (
      <header class="dn-section-header">
        <h4>{ title }</h4>

        {
          noUseClose === false ? <dn-ui-button
            onClick={btnCloseHandler}
            style={{ padding: 0, height: 'auto', backgroundColor: 'transparent' }}
          >
            <dn-ui-icon name="close" size="20" />
          </dn-ui-button> : void(0)
        }
      </header>
    )
  }
}

export default SectionHeader
