<template>
  <dn-ui-modal ref="$modal" :settings="settings">
    <header slot="title">
      <div class="image-modal-title">
        <h3 style="margin: 0;">이미지 미리보기</h3>
        <span>
          <a :href="file.url" target="_blank">
            <dn-ui-button>
              <dn-ui-icon name="attach" size="20" />
            </dn-ui-button>
          </a>
          <span style="margin-left: 16px"></span>
          <dn-ui-button @click="hide">
            <dn-ui-icon name="close" size="20" />
          </dn-ui-button>
        </span>
      </div>
    </header>
    <div class="image-modal-content">
      <img class="image-modal-image" :src="file.url" />
    </div>
  </dn-ui-modal>
</template>

<script>
import { ModalMixin } from '@/mixin/modal'

export default {
  name: 'DNImageModal',

  mixins: [ModalMixin],

  data() {
    return {
      /**
       * @typedef File
       * @property {string} uid
       * @property {string} url
       * @property {string} filename
       *
       * @type {File}
       */
      file: {},
    }
  },

  methods: {
    show(file) {
      this.file = file
      this.$refs?.$modal.show()

      document
        .querySelector('.modals')
        .addEventListener('click', this.onBackgroundClick.bind(this))
    },

    hide() {
      this.$refs?.$modal.hide()

      // GOTCHA:
      // Modal의 `closable` 설정을 사용하면 Dimmer 클릭 시 다이얼로그도 같이 꺼짐
      // 모달만 꺼지도록 직접 이벤트 핸들러를 관리함
      document
        .querySelector('.modals')
        .removeEventListener('click', this.onBackgroundClick.bind(this))
    },

    onBackgroundClick(e) {
      e.stopPropagation()

      if (e.target.matches('.modals')) this.hide()
    },
  },
}
</script>

<style lang="scss">
.image-modal {
  &-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &-content {
    display: flex;
    align-content: center;
    justify-content: center;
  }

  &-image {
    max-width: 100%;
    max-height: calc(100vh - 120px);
  }
}
</style>
