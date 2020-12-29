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

        <dn-ui-modal
          ref="$instruction"
          close
          settings={{
            duration: 0,
            context: '.annotation-container',
            centered: true
          }}
        >
          <h4 slot="title">
            {parent.$t('annotation.instruction.title')}
          </h4>
          
          {renderInstructionDetail(scopedSlots.instructionDetail)}

          <template slot="actions">
            <dn-ui-button class="btn-confirm approve" color="dark-blue">
              {parent.$t('annotation.instruction.detail.button.okay')}
            </dn-ui-button>
          </template>
        </dn-ui-modal>

        <AlertModal ref="$dnAlert" />
      </main>
    )
  }
}

const renderInstructionDetail = scopedSlot => scopedSlot && scopedSlot()

export default BaseLayout
