import $ from 'jquery'

window.jQuery = window.$ = $

document.querySelector('head').append((() => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.js'; s.setAttribute('integrity', 'sha256-t8GepnyPmw9t+foMh3mKNvcorqNHamSKtKRxxpUEgFI='); s.setAttribute('crossorigin', 'anonymous'); return s })())

class ModalProps {
  /**
   * @typedef TypeModalProps
   * @prop {{
   *   closable: boolean
   *   duration: boolean
   *   context: string
   *   centered: boolean
   *   allowMultiple: boolean 
   * }} settings
   */
  static toScheme() {
    /**
     * @type {import('vue/types/options').PropsDefinition<TypeModalProps>}
     */
    const props = {
      settings: Object
    }

    return props
  }
}

/** @type {import("vue/types/umd").ComponentOptions<Vue, never, never, never, TypeModalProps>} */
const modal = {
  props: ModalProps.toScheme(),

  watch: {
    settings() {
      this._initialize()
    }
  },

  methods: {
    _initialize() {
      setTimeout(() => {
        $(this.$el).modal({
          ...this.settings,
          onShow: () => {
            this.$emit('show')
            document.body.style.overflowY = 'hidden'
          },
          onVisible: () => {
            this.$emit('showed')
          },
          onHide: () => {
            this.$emit('hide')
          },
          onHidden: () => {
            this.$emit('hidden')
            document.body.style.overflowY = null
          },
          onApprove: (...args) => {
            const e = new CustomEvent('dnUIModal::Approve', { cancelable: true })
  
            Object.defineProperty(e, 'target', {
              get() { return args[0] }
            })
  
            this.$emit('approve', e)
  
            if (e.defaultPrevented) {
              return false
            }
          },
          onDeny: (...args) => {
            const e = new CustomEvent('dnUIModal::Deny', { cancelable: true })
  
            Object.defineProperty(e, 'target', {
              get() { return args[0] }
            })
  
            this.$emit('deny', e)
  
            if (e.defaultPrevented) {
              return false
            }
          }
        })
      }, 1000)
    },

    /**
     * @param {'show' | 'hide'} v 
     */
    _active(v) {
      $(this.$el).modal(v)
    },

    show() {
      this._active('show')
    },

    hide() {
      this._active('hide')
    }
  },

  mounted() {
    this._initialize()
  },

  render(h) {
    const $scpSl = this.$scopedSlots

    /** @type {import('vue/types/umd').VNode[]} */
    const [title] = ($scpSl.title && $scpSl.title()) ?? []
    const conts = ($scpSl.contents && $scpSl.contents()) || ($scpSl.default && $scpSl.default())
    const actions = ($scpSl.actions && $scpSl.actions()) ?? []
    const children = []

    if(title) {
      title.data.staticClass = 'header'

      children.push(title)
    }

    if(conts) {
      children.push(
        h('div', { staticClass: 'content' }, conts)
      )
    }

    if(actions.length) {
      children.push(
        h('div', { staticClass: 'actions' }, actions)
      )
    }
    
    return h(
      'div',
      {
        class: 'ui modal'
      },
      children
    )
  },

  destroyed() {
    document.body.style.overflowY = null
  }
}

export default modal
