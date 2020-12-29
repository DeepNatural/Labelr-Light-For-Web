<template>
  <dn-ui-modal
    @approve="onApprove"
    @hide="onHide"
    ref="$modal"
    :settings="settings"
    class="basic-modal alert-modal"
  >
    <h4 slot="title">
      {{ title }}
    </h4>

    <div v-html="message"></div>

    <template slot="actions">
      <button v-if="useDeny" type="button" class="ui button basic deny">
        {{ buttonText.deny }}
      </button>

      <button type="button" class="ui button basic primary approve">
        {{ buttonText.approve }}
      </button>
    </template>
  </dn-ui-modal>
</template>

<script>
import _ from 'lodash'
import { ModalMixin } from '@/mixin/modal'

export default {
  name: 'DNAlertModal',
  
  data: () => ({
    _showId: '',
    title: '',
    message: '',
    useDeny: false,
    buttonText: {
      deny: null,
      approve: null
    }
  }),

  mixins: [ ModalMixin ],

  methods: {
    show({ title, message, useDeny = false, buttonText }) {
      this.title = title ?? this.$t('annotation.modal.alert.title')
      this.message = message
      this.useDeny = useDeny
      this.buttonText = {
        deny: buttonText?.deny ?? this.$t('annotation.modal.alert.actions.button.cancel'),
        approve: buttonText?.approve ?? this.$t('annotation.modal.alert.actions.button.confirm')
      }
      this.$refs.$modal.show()

      this.$evEmitter.listenerCount(this._showId) && this.$evEmitter.off(this._showId)
      
      return new Promise(resolve => {
        this._showId = `DNALERTMODAL@${(_.random(1e14, 1e15 - 1)).toString(32)}`

        this.$evEmitter.once(this._showId, result => {
          resolve(result)
        })
      })
    },

    onApprove() {
      this.$evEmitter.emit(this._showId, true)
    },

    onHide() {
      this.$evEmitter.emit(this._showId, false)
    }
  }
}
</script>
