import _ from 'lodash'
import ev, { Types } from '../utils/eventBus'
import AnnoationHeader from '../components/Layout/AnnotationHeader'

/**
 * @type {import('vue/types/umd').ComponentOptions<Vue>}
 */
export const LayoutMixin = {
  data: () => ({
    visibleInstruction: true
  }),

  methods: {
    viewDetail() {
      this.$refs.$instruction?.show()
    },

    toggleInstruction() {
      this.visibleInstruction = !this.visibleInstruction
    },

    onClickCloseButton() {
      this.toggleInstruction()
    }
  },

  components: {
    AnnoationHeader
  },

  created() {
    ev.$on(Types.STORE, ({ result, tags }) => {

    })
  },

  destroyed() {
    document.querySelector('.ui.modals').remove()
  }
}
