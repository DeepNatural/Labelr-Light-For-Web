<template>
  <dn-ui-modal
    @approve="$emit('approve')"
    @deny="$emit('deny')"
    ref="$modal"
    :settings="settings"
    class="basic-modal"
  >
    <h4 slot="title">
      {{ title }}
    </h4>

    <div v-html="message"></div>

    <template slot="actions">
      <button v-if="useDeny" type="button" class="ui button basic deny">
        {{ buttons.deny }}
      </button>

      <button type="button" class="ui button basic primary approve">
        {{ buttons.approve }}
      </button>
    </template>
  </dn-ui-modal>
</template>

<script>
import { ModalMixin } from '@/mixin/modal'

export default {
  name: 'DNBasicModal',

  props: {
    title: String,
    message: String,
    buttons: {
      type: Object,
      default: () => ({
        deny: '취소',
        approve: '확인'
      })
    },
    useDeny: {
      type: Boolean,
      default: true
    }
  },

  mixins: [ ModalMixin ]
}
</script>
