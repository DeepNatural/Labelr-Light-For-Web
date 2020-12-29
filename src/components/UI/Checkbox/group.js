class CheckboxGroupProps {
  /**
   * @typedef CheckboxItem
   * @prop {string} label
   * @prop {boolean | string | number} value
   * 
   * @typedef TypeCheckboxGroupProps
   * @prop {Array<boolean | string | number>} value
   * @prop {string} name
   * @prop {boolean} disabled
   * @prop {CheckboxItem[]} items
   */
  static toScheme() {
    /**
     * @type {import('vue/types/options').PropsDefinition<TypeCheckboxGroupProps>}
     */
    const props = {
      value: Array,
      name: String,
      disabled: Boolean,
      items: {
        type: Array,
        default: () => []
      },
      checkboxStyle: {
        type: Object,
        default: () => {}
      },
      maxCheckCount: Number
    }

    return props
  }
}

/**
 * @type {import('vue').ComponentOptions}
 */
const DNCheckboxGroup = {
  name: 'DNCheckboxGroup',

  model: {
    prop: 'value'
  },

  props: CheckboxGroupProps.toScheme(),

  methods: {
    updateValue(value) {
      const index = this.findIndex(value)
      
      if (index !== -1) this.value.splice(index, 1)
      else this.value.push(value)

      if(this.value.length - 1 >= this.maxCheckCount) {
        this.value.splice(index, 1)
      }

    },

    findIndex(value) {
      return this.value.indexOf(value)
    },

    getCheckboxValue(value) {
      return this.findIndex(value) === -1 ? null : value
    }
  },

  render(h) {
    /** @type{import('vue').VNode[]} */
    const defaultSlot = this.$slots.default
    let children = []

    if(defaultSlot && defaultSlot.length) {
      children = defaultSlot.map((VNode, i) => {
        const propsData = VNode.componentOptions.propsData

        propsData.name = this.name
        propsData.value = this.getCheckboxValue(propsData.val)

        VNode.componentOptions.listeners = {
          ...VNode.componentOptions.listeners,
          input: () => {
            this.updateValue(propsData.val)
          }
        }

        return VNode
      })
    } else {
      children = this.items.map((item, i) => {
        return h(
          'dn-ui-checkbox',
          {
            props: {
              name: this.name,
              val: item.value,
              label: item.label,
              disabled: item.disabled,
              value: this.getCheckboxValue(item.value)
            },
            style:  this.checkboxStyle ,
            on: {
              input: () => {
                this.updateValue(item.value)
              }
            }
          }
        )
      })
    }

    return h(
      'div',
      children
    )
  },
}

export default DNCheckboxGroup
