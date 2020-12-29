<template>
  <div :class="{ 'dn-dropdown': true, fluid: this.fluid }">
    <label
      v-if="label"
      @click="show"
      :for="id"
    >
      {{ label }}
    </label>
    <select
      v-model="_value"
      ref="$dropdown"
      :id="id"
      :name="name"
      :class="className"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option
        v-for="(item) in items"
        :key="item.value"
        :value="item.value"
      >
        {{ item.name }}
      </option>
    </select>
  </div>
</template>

<script>
import _ from 'lodash'
import $ from 'jquery'

window.jQuery = window.$ = $

document.querySelector('head').append((() => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.js'; s.setAttribute('integrity', 'sha256-t8GepnyPmw9t+foMh3mKNvcorqNHamSKtKRxxpUEgFI='); s.setAttribute('crossorigin', 'anonymous'); return s })())

class DropdownProps {
  /**
   * @typedef TypeDropdownProps
   * @prop {string | number} value
   * @prop {{ name: string, value: string }[]} items
   * @prop {boolean} search
   * @prop {boolean} multiple
   * @prop {boolean} inline
   * @prop {boolean} loading
   * @prop {boolean} error
   * @prop {boolean} disabled
   * @prop {boolean} scrolling
   * @prop {boolean} compact
   * @prop {boolean} fluid
   * @prop {string} name
   * @prop {string} label
   * @prop {string} id
   * @prop {string} placeholder
   */
  static toScheme() {
    /**
     * @type {import('vue/types/options').PropsDefinition<TypeDropdownProps>}
     */
    const props = {
      value: [ String, Number ],

      items: {
        type: Array,
        default: () => []
      },

      search: Boolean,    // 검색 기능 사용
      multiple: Boolean,  // 다중 선택 사용
      inline: Boolean,    // display: inline 으로 변환
      loading: Boolean,   // 로딩 인디케이터
      error: Boolean,     // 에러 표시
      disabled: Boolean,  // 비활성화
      scrolling: Boolean, // 드롭다운 아이템 목록에 스크롤바 사용
      compact: Boolean,   // 최소 사이즈의 드롭다운 사용
      fluid: Boolean,     // 최대 사이즈의 드롭다운 사용

      name: String,
      label: String,
      id: String,
      placeholder: String,

      noUseKeys: {        // 드롭다운에서 제공하는 기본 단축키들 미사용
        type: [Boolean, Array],
        default: false,
      }
    }

    return props
  }
}

export default {
  name: 'DNDropdown',

  props: DropdownProps.toScheme(),

  computed: {
    _value: {
      set(value) {
        this.$emit('input', value)
      },

      get() {
        return this.value
      }
    },

    className() {
      let className = ['ui', 'dropdown', 'selection']

      if(this.search) className.push('search')
      if(this.multiple) className.push('multiple')
      if(this.inline) className.push('inline')
      if(this.loading) className.push('loading')
      if(this.error) className.push('error')
      if(this.disabled) className.push('disabled')
      if(this.scrolling) className.push('scrolling')
      if(this.compact) className.push('compact')
      if(this.fluid) className.push('fluid')

      return className
    }
  },

  watch: {
    className() {
      this._initialize()
    },

    value(v) {
      const item = this.items.filter(_v => _v.value === v)[0]
      const $dropdown = $(this.$refs.$dropdown)
      
      if(item) $dropdown.dropdown('set text', item.name)
      else {
        const selectedValue = $dropdown.dropdown('get value')
        const isClearedOr$Dropdown = $dropdown
          .dropdown('restore placeholder text')
          .dropdown('remove selected', selectedValue)

        if(isClearedOr$Dropdown) {
          isClearedOr$Dropdown.find('.icon')
            .removeClass('clear')
        }
      }
    }
  },

  methods: {
    _initialize() {
      this.$nextTick(() => {
        const $el = this.$el
        const $dropdown = this.$refs.$dropdown
        const search = this.search
        const noUseKeys = this.noUseKeys
        const vIds = Object.keys($el.dataset).filter(n => n.match(/v-/))
        const keys = noUseKeys === true ? false : {}

        if(noUseKeys instanceof Array) {
          noUseKeys.forEach(keyName => {
            keys[keyName] = false
          })
        }

        $($dropdown).dropdown({
          clearable: search,
          forceSelection: false,
          duration: 0,
          onShow: () => this.$emit('show'),
          onHide: () => this.$emit('hide'),
          keys,
          message: {
            noResults: '찾을 수 없습니다 :('
          },
        }).prevObject.prop('class', this.className.join(' '))

        $el.querySelectorAll('*')
          .forEach(el => {
            if(el !== $dropdown) {
              vIds.forEach(vId => el.dataset[vId] = '')
            }
          })

        if(search) {
          const search = $el.querySelector('input.search')
          const evNms = [ 'keyup', 'keydown', 'keypress' ]

          evNms.forEach(name => {
            search.addEventListener(name, e => this.$emit(`search${_.capitalize(name)}`, e))
          })

          search.addEventListener('focus', () => {
            $($dropdown).dropdown('hide')
          })
        }
      })
    },

    show() {
      $(this.$refs.$dropdown).dropdown('show')
    }
  },

  mounted() {
    this._initialize()
  }
}
</script>
