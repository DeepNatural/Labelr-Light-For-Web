<template>
  <div
    role="button"
    tabindex="0"
    class="dn-checkbox"
  >
    <input
      @input="$value = checked ? false : val"
      :type="type"
      :id="$id"
      :name="name"
      :value="val"
      :disabled="disabled"
      :checked="checked"
    />
    <label v-if="label" :for="disabled ? null : $id">
      <dn-ui-icon :name="checked ? `${icon}on` : `${icon}off`" size="32" />
      {{ label }}
    </label>

    <label v-else :for="disabled ? null : $id">
      <dn-ui-icon :name="checked ? `${icon}on` : `${icon}off`" size="32" />
      <slot name="label"></slot>
    </label>
  </div>
</template>

<script>
import _ from 'lodash'
import { isValid, generateUniqueId } from '@/utils'

const CHECKBOX = {
  TYPE: {
    CHECKBOX: 'checkbox',
    RADIO: 'radio',
  }
}

class CheckboxProps {
  /**
   * @typedef TypeCheckboxProps
   * @prop {boolean | string | number | Array<boolean | string | number>} value
   * @prop {'checkbox' | 'radio'} type
   * @prop {string} name
   * @prop {string} id
   * @prop {boolean | string | number} val
   * @prop {string} label
   * @prop {boolean} disabled
   */
  static toScheme() {
    /**
     * @type {import('vue/types/options').PropsDefinition<TypeCheckboxProps>}
     */
    const props = {
      value: [ Boolean, String, Number ],
      type: {
        type: String,
        default: 'checkbox',
        validator: type => isValid.string(CHECKBOX.TYPE[type.toUpperCase()])
      },
      name: String,
      id: String,
      val: {
        type: [ Boolean, String, Number ],
        default: true
      },
      label: String,
      disabled: Boolean
    }

    return props
  }
}

export default {
  name: 'DNCheckbox',

  model: {
    prop: 'value'
  },

  props: CheckboxProps.toScheme(),

  computed: {
    icon() {
      return this.type === 'radio' ? 'radio' : 'check'
    },

    $value: {
      get() {
        return this.value
      },

      set(v) {
        this.$emit('input', v)
      }
    },

    $id() {
      return this.id ?? generateUniqueId('id')
    },

    checked() {
      return this.$value === this.val
    }
  }
}
</script>
