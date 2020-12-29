/**
 * @type {import('vue/types/umd').ComponentOptions<Vue>}
 */
export const ModalMixin = {
  computed: {
    settings: () => ({
      duration: 0,
      context: '.annotation-container',
      centered: true,
      closable: false
    })
  },

  methods: {
    show() {
      this.$refs.$modal.show()
    },

    hide() {
      this.$refs.$modal.hide()
    }
  }
}
