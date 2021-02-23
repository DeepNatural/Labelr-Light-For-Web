import { generateUniqueId } from '../../../utils'

class TextareaProps {
  static toScheme() {
    const props = {
      name: String,
      id: String,
      placeholder: String,
      disabled: Boolean,
      label: String,
      value: [String, Number],
      rows: {
        type: String,
        default: '8',
      },
      cols: String,
      minLength: Number,
      maxLength: {
        type: Number,
        default: 280,
      },
      visibleLength: {
        type: Boolean,
        default: true,
      },
      textareaStyle: [String, Object],
    }

    return props
  }
}

const Textarea = {
  name: 'DNTextarea',

  props: TextareaProps.toScheme(),

  computed: {
    _id() {
      return this.id ?? generateUniqueId('id')
    },

    textLength() {
      return this.value?.length || 0
    },
  },

  watch: {
    value(v) {
      this.$refs.$textarea.value = v
    },
  },

  methods: {
    inputText(e) {
      if (this.disabled) {
        e.target.value = this.value
        return null
      }

      if (this.maxLength) {
        if (this.maxLength < e.target.value.length) {
          e.target.value = e.target.value.slice(0, this.maxLength)
        }
      }

      this.$emit('input', e.target.value)
    },
  },

  render(h) {
    let className = 'dn-textarea field'
    let uiTextareaClassName = 'ui textarea'

    const props = this.$props
    const attrs = {}

    const textarea = h(
      'textarea',
      {
        ref: '$textarea',
        style: props.textareaStyle,
        attrs: {
          name: props.name,
          id: this._id,
          placeholder: props.placeholder,
          value: this.value,
          rows: props.rows,
          cols: props.cols,
        },
        on: {
          input: e => this.inputText(e),
          focus: e => this.$emit('focus', e),
          blur: e => this.$emit('blur', e),
          keyup: e => this.$emit('keyup', e),
          keydown: e => this.inputText(e),
          keypress: e => this.$emit('keypress', e),
        },
      },
      [this.value]
    )

    const children = []

    if (props.disabled) uiTextareaClassName += ' disabled'

    if (props.label) {
      children.push(
        h(
          'label',
          {
            attrs: {
              for: this._id,
            },
            on: {
              mouseover: e => {
                this.$emit('labelMouseover', e)
              },
            },
          },
          [props.label]
        )
      )
    }

    children.push(
      h(
        'div',
        {
          class: uiTextareaClassName,
        },
        [textarea]
      )
    )

    let minLength = ''

    if (props.minLength) {
      if (this.textLength < props.minLength) {
        minLength = h(
          'span',
          {
            class: 'min-length',
          },
          [props.minLength + '자 이상 작성해주세요']
        )
      }
    }

    let valueLength = ''

    if (props.visibleLength) {
      valueLength = h(
        'span',
        {
          class: 'value-length',
        },
        this.textLength
      )
    }

    let maxLengthSpan = ''

    if (props.maxLength) {
      maxLengthSpan = h(
        'span',
        {
          class: 'max-length',
        },
        ['/' + props.maxLength]
      )
    }

    children.push(
      h(
        'div',
        {
          class: 'ui textarea length',
        },
        [minLength, valueLength, maxLengthSpan]
      )
    )

    return h(
      'div',
      {
        class: className,
        attrs,
      },
      [children]
    )
  },
}

export default Textarea
