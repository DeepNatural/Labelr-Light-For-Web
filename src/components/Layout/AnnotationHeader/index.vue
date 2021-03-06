<template>
  <header
    :class="{
      'annotation-header': true,
    }"
  >
    <div class="logo-wrapper">
      <img
        :src="require('../../../assets/imgs/symbol.svg')"
        alt="DeepNatural"
      />
    </div>

    <div class="title-wrapper">
      <h4 v-if="useTitle">{{ title }}</h4>
    </div>

    <div class="theme-wrapper" v-if="useTheme">
      <dn-ui-icon name="day" />
      <div class="theme-toggle" role="button">
        <input
          v-model="isNightTheme"
          type="checkbox"
          id="theme"
          :value="true"
        />
        <label for="theme"></label>
      </div>
      <dn-ui-icon name="night" />
    </div>

    <div class="skip-wrapper small">
      <div v-if="skip.use" class="skip-checkbox">
        <dn-ui-checkbox
          v-model="skip.checked"
          id="skip"
          :label="skip.message"
        />
      </div>
    </div>

    <div class="action-wrapper">
      <template v-if="isTaskMode">
        <dn-ui-button @click="$router.go(-1)" size="small" color="secondary">
          {{ $t('annotation.header.button.endTask') }}
        </dn-ui-button>
        <dn-ui-button
          @click="$refs.$submit[0].show()"
          size="small"
          color="primary"
          :disabled="!isValid"
        >
          {{ $t('annotation.header.button.submit') }}
        </dn-ui-button>
      </template>
    </div>

    <basic-modal
      v-for="modal in basicModalList"
      :ref="`$${modal.name}`"
      :key="modal.name"
      :title="$t(`annotation.modal.${modal.name}.title`)"
      :message="$t(`annotation.modal.${modal.name}.description`)"
      :buttons="{
        deny: $t(`annotation.modal.${modal.name}.actions.button.cancel`),
        approve: $t(
          `annotation.modal.${modal.name}.actions.button.${modal.name}`
        ),
      }"
      @approve="() => $evEmitter.emit($evEmitter.types.ACTION, modal.name)"
    />

    <basic-modal
      ref="$exit"
      :title="$t(`annotation.modal.exit.title`)"
      :message="$t(`annotation.modal.exit.description`)"
      :buttons="{
        deny: $t(`annotation.modal.exit.actions.button.cancel`),
        approve: $t(`annotation.modal.exit.actions.button.exit`),
      }"
      @approve="() => $evEmitter.emit($evEmitter.types.ACTION, 'exit')"
    />
  </header>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import BasicModal from '../../Modal/Basic.vue'

export default {
  name: 'DNAnnotationHeader',

  props: {
    title: String,
    useTitle: {
      type: Boolean,
      default: true,
    },
    useTheme: {
      type: Boolean,
      default: true,
    },
  },

  computed: {
    ...mapState('annotationTool', ['theme', 'skip']),

    ...mapGetters('annotationTool', ['isValid', 'isTaskMode']),

    isNightTheme: {
      get() {
        return this.theme !== 'day'
      },

      set(isNightTheme) {
        this.setTheme({ theme: isNightTheme ? 'night' : 'day' })
      },
    },

    basicModalList() {
      const { isTaskMode } = this
      const list = []

      if (isTaskMode) {
        list.push({ name: 'submit' })
      }

      return list
    },
  },

  watch: {},

  methods: {
    ...mapMutations('annotationTool', {
      setTheme: 'SET_THEME',
    }),
  },

  components: {
    BasicModal,
  },
}
</script>
