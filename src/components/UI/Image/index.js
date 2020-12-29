class DNImageProps {
  /**
   * @typedef TypeDNImageProps
   * @prop {boolean} lazy
   * @prop {string} src
   */
  static toScheme() {
    /**
     * @type {import('vue/types/options').PropsDefinition<TypeDNImageProps>}
     */
    const props = {
      lazy: {
        type: Boolean,
        default: true
      },
      src: {
        type: String,
        validator: v => v ? true : false
      }
    }

    return props
  }
}

/**
 * @type {import('vue').ComponentOptions}
 */
const DNImage = {
  name: 'DNImage',

  data: () => ({
    loading: false
  }),

  props: DNImageProps.toScheme(),

  render(h) {
    const { src, lazy, loading } = this
    const lazyAndLoading = lazy && loading
    const img = h('img', {
      attrs: { src },
      ref: '$img',
      on: {
        load: () => {
          this.loading = false
        }
      }
    })
    const el = h('div', {
      staticClass: 'dn-image ui segment',
      class: {
        loading: lazyAndLoading
      },
      style: {
        minHeight: lazyAndLoading ? '200px' : 'auto'
      }
    }, [img])

    return el
  },

  created() {
    this.loading = true
  }
}

export default DNImage
