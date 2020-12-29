import { generateUniqueId } from '@/utils'
import DNIcon from '../Icon'

const TYPES = [ 'email', 'hidden', 'number', 'password', 'search', 'tel', 'text', 'url' ]

class InputProps {
  /**
   * @typedef TypeInputProps
   * @prop {'email'|'hidden'|'number'|'password'|'search'|'tel'|'text'|'url'} type
   * @prop {string} name
   * @prop {string} id
   * @prop {string} placeholder
   * @prop {string | boolean} autocomplete
   * @prop {boolean} loading
   * @prop {boolean} disabled
   * @prop {boolean} readonly
   * @prop {boolean} error
   * @prop {boolean} success
   * @prop {boolean} fluid
   * @prop {boolean} noField
   * @prop {string} label
   */
  static toScheme() {
    /**
     * @type {import('vue/types/options').PropsDefinition<TypeInputProps>}
     */
    const props = {
      value: [ String, Number ],

      type: {
        type: String,
        default: 'text',
        validator: type => TYPES.indexOf(type) !== -1
      },
      name: String,
      id: String,
      placeholder: String,
      tabindex: {
        type: [String, Number],
        default: '0'
      },
      autocomplete: [ String, Boolean ],

      loading: Boolean,
      disabled: Boolean,
      readonly: Boolean,
      error: Boolean,
      success: Boolean,
      fluid: {
        type: Boolean,
        default: true
      },
      bold: Boolean,
      label: String,
      autofocus: Boolean,
    }

    return props
  }
}

/**
 * @type {import('vue/types/umd').ComponentOptions<Vue>}
 */
const Input = {
  name: 'DNInput',

  props: InputProps.toScheme(),

  computed: {
    _id() {
      return this.id ?? generateUniqueId('id')
    }
  },

  watch: {
    value(v) {
      this.$refs.$input.value = v
    }
  },

  methods: {
    _focus() {
      this.$refs.$input.focus()
    },

    _blur() {
      this.$refs.$input.blur()
    }
  },

  render(h) {
    let className = 'dn-input field'
    let uiInputClassName = 'ui input'
    const props = this.$props
    const attrs = {}
    const input = h(
      'input',
      {
        ref: '$input',
        attrs: {
          type: props.type,
          name: props.name,
          id: this._id,
          placeholder: props.placeholder,
          autocomplete: props.autocomplete,
          tabindex: props.tabindex,
          value: this.value,
          autofocus: this.autofocus,
          readonly: this.readonly
        },
        on: {
          input: e => this.$emit('input', e.target.value),
          focus: e => this.$emit('focus', e),
          blur: e => this.$emit('blur', e),
          keyup: e => this.$emit('keyup', e),
          keydown: e => this.$emit('keydown', e),
          keypress: e => this.$emit('keypress', e),
        }
      }
    )
    const children = []

    if(props.error) className += ` error`
    if(props.success) className += ` success`

    if(props.loading) uiInputClassName += ` loading`
    if(props.disabled) uiInputClassName += ` disabled`
    if(props.fluid) uiInputClassName += ` fluid`
    if(props.bold) uiInputClassName += ` bold` 

    if(props.label) {
      children.push(h(
        'label',
        {
          attrs: {
            for: this._id
          },
          on: {
            mouseover: e => {
              this.$emit('labelMouseover', e)
            }
          }
        },
        [ props.label ]
      ))
    }

    children.push(h(
      'div',
      { class: uiInputClassName },
      [
        input,
        (
          (props.error || props.success) ?
          h(
            DNIcon,
            {
              props: {
                name: `formcheck-${props.error ? 'error' : 'ok'}`
              }
            }
          ) :
          null
        )
      ]
    ))

    if(this.$slots.message) {
      children.push(h(
        'div',
        {
          class: 'validation-message small',
          scopedSlots: 'message'
        },
        this.$slots.message
      ))
    }

    return h(
      'div',
      {
        class: className,
      attrs
      },
      children
    )
  }
}

export default Input
