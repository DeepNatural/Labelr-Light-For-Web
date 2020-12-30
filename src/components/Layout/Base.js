import { isValid } from '@/utils/isValid'
import AlertModal from '../Modal/Alert.vue'

class BaseLayoutProps {
  /**
   * @typedef TypeBaseLayoutProps
   * @prop {string | 'A' | 'B'} type
   */
  static toScheme() {
    /**
     * @type {import('vue/types/options').PropsDefinition<TypeBaseLayoutProps>}
     */
    const props = {
      type: String
    }

    return props
  }
}

/**
 * @type {import('vue/types').FunctionalComponentOptions<TypeBaseLayoutProps>}
 */
const BaseLayout = {
  name: 'DNBaseLayout',

  functional: true,

  props: BaseLayoutProps.toScheme(),

  render(h, { props: { type }, scopedSlots, parent }) {
    return (
      <main
        class={{
          'annotation-container': true,
          [`type-${type.toLowerCase()}`]: isValid.string(type)
        }}
      >
        {scopedSlots.default()}

        <AlertModal ref="$dnAlert" />
      </main>
    )
  }
}

const renderInstructionDetail = scopedSlot => scopedSlot && scopedSlot()

export default BaseLayout
