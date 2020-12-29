<template>
  <dn-annotation-base-layout type="A">
    <AnnoationHeader
      :progress="progress"
      :use-title="false"
      :use-theme="useTheme"
    />

    <section :class="{
      'annotation-main-container': true,
      'hide-instruction': !visibleInstruction
    }">
      <transition name="side-folding">
        <div v-show="visibleInstruction" class="side-container">
          <div class="instruction-wrapper">
            <dn-ui-section-header
              @clickCloseButton="onClickCloseButton"
              :title="$t('annotation.instruction.title')"
            />

            <slot name="main-description" />

            <dn-ui-button v-if="!noUseInstruction && hasInstruction" @click="viewDetail" class="btn-view-detail">
              {{ $t('annotation.side.button.viewDetails') }} &gt;
            </dn-ui-button>

            <div class="description-wrapper">
              <slot name="descriptions" />
            </div>
          </div>
        </div>
      </transition>

      <div class="main-container">
        <div v-if="title" class="title-wrapper">
          <h4>
            {{ title }}
          </h4>
        </div>
        <slot name="main" />
      </div>

      <div v-if="!noRightPanel" class="side-container">
        <slot name="right-side" />
      </div>
    </section>

    <div class="toolbar-container small flex items-center justify-between">
      <div class="control-instruction-wrapper">
        <dn-ui-button @click="toggleInstruction" basic style="padding-left: 0; padding-right: 0; width: 32px;">
          <dn-ui-icon :name="visibleInstruction ? 'closepanel' : 'openpanel'" />
        </dn-ui-button>
        <span>
          {{
            visibleInstruction
            ? $t('annotation.footer.button.closeInstruction')
            : $t('annotation.footer.button.openInstruction')
          }}
        </span>
      </div>

      <div class="toolbar-wrapper">
        <slot name="toolbar" />
      </div>

      <div class="control-help-wrapper flex justify-end">
        <div v-if="false" class="button-wrapper help">
          <span>
            {{ $t('annotation.footer.button.help') }}
          </span>
          <dn-ui-button basic style="padding-left: 0; padding-right: 0; width: 32px;">
            <dn-ui-icon name="help" />
          </dn-ui-button>
        </div>

        <div v-if="isIntercomBooted" class="button-wrapper intercom">
          <span>
            {{ $t('annotation.footer.button.intercom') }}
          </span>
          <dn-ui-button
            @click="$store.dispatch('intercom/toggle')"
            basic
            style="padding-left: 0; padding-right: 0; width: 32px;"
          >
            <dn-ui-icon name="intercom" />
          </dn-ui-button>
        </div>
      </div>
    </div>

    <slot name="description"></slot>

    <slot slot="instructionDetail" name="instructionDetail"></slot>
  </dn-annotation-base-layout>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import AnnoationHeader from '../AnnotationHeader'

/**
 * @typedef TypeLayoutProps
 * @prop {string} title
 * @prop {boolean} noRightPanel
 */
class LayoutProps {
  static toScheme() {
    /**
     * @type {import('vue/types/options').PropsDefinition<TypeLayoutProps>}
     */
    const props = {
      title: String,
      progress: Number,
      hasRejectReason: Boolean,
      noRightPanel: Boolean,
      config: Object,
      noUseInstruction: Boolean,
      useTheme: {
        type: Boolean,
        default: true
      }
    }

    return props
  }
}

export default {
  name: 'DNLayoutTypeA',

  props: LayoutProps.toScheme(),

  computed: {
    ...mapState('annotationTool', [
      'visibleInstruction',
      'taskRun',
    ]),

    /**
     * Vuex Intercom 은 Web Platform 에 있습니다.
     */
    ...mapState('intercom', {
      isIntercomBooted: 'isBooted'
    }),

    /** Tool Code에 instruction이 있는지 여부입니다. */
    hasInstruction() {
      return this.$slots.instructionDetail
    }
  },

  methods: {
    ...mapMutations('annotationTool', {
      toggleInstruction: 'TOGGLE_INSTRUCTION'
    }),

    copy({ target }) {
      const range = document.createRange()

      range.setStart(target, 0)
      range.setEnd(target, 1)
      
      const selection = window.getSelection()

      selection.removeAllRanges()
      selection.addRange(range)

      document.execCommand('copy', false, range.toString())
    },

    viewDetail() {
      this.$refs.$instruction.show()
    },

    onClickCloseButton() {
      this.toggleInstruction()
    }
  },

  components: {
    AnnoationHeader
  }
}
</script>
