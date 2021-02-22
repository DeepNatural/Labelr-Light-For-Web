<template>
  <dn-annotation-base-layout type="A">
    <AnnoationHeader
      :progress="progress"
      :use-title="!!headerTitle"
      :title="headerTitle"
      :use-theme="useTheme"
    />

    <section
      :class="{
        'annotation-main-container': true,
      }"
    >
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
      <div class="control-instruction-wrapper"></div>

      <div class="toolbar-wrapper">
        <slot name="toolbar" />
      </div>

      <div class="control-help-wrapper flex justify-end">
        <div v-if="false" class="button-wrapper help">
          <span>
            {{ $t('annotation.footer.button.help') }}
          </span>
          <dn-ui-button
            basic
            style="padding-left: 0; padding-right: 0; width: 32px;"
          >
            <dn-ui-icon name="help" />
          </dn-ui-button>
        </div>
      </div>
    </div>

    <slot name="description"></slot>
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
      noRightPanel: Boolean,
      config: Object,
      useTheme: {
        type: Boolean,
        default: true,
      },
      headerTitle: String,
    }

    return props
  }
}

export default {
  name: 'DNLayoutTypeA',

  props: LayoutProps.toScheme(),

  computed: {
    ...mapState('annotationTool', ['taskRun']),
  },

  components: {
    AnnoationHeader,
  },
}
</script>
