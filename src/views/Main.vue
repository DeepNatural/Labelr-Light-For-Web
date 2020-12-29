<template>
  <div
    class="ui container fluid"
    :class="$store.state.annotationTool.theme"
  >
    <dn-annotation-tool-polygon
      :labels="labels"
      :context="context"
      @request="onRequest"
    >
      <description main>
        <header>
          <!-- 작업도구 제목 -->
        </header>
        <div>
          <div>
            <!-- 작업도구 설명 -->
          </div>
        </div>
      </description>
    </dn-annotation-tool-polygon>

    <div
      v-if="!context.url"
      class="flex items-center justify-center img-file-upload"
    >
      <div>
        <div>이미지를 업로드 하세요</div>
        <dn-ui-button
          :file="{ accept: 'image/*' }"
          @inputFile="onInputFile"
        >
          이미지 파일찾기
        </dn-ui-button>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'Main',
  
  data: () => ({
    context: {
      url: null
    },
    labels: ['눈', '코'],
    result: {}
  }),

  methods: {
    onRequest({ action, payload }) {
      switch (action) {
        case 'store':
          this.result = payload.result
          break
        case 'submit':
          this.download(payload.result)
          location.reload()
          break
      }
    },

    onInputFile({ target }) {
      this.context.url = URL.createObjectURL(target.files[0])
    },

    download(result) {
      const fileName = `result_${dayjs().format('YYYYMMDDHHmmss')}.json`
      const a = document.createElement('a')
      const resultFile = new File(
        [JSON.stringify(result)],
        fileName,
        { type: 'application/json', }
      )
      a.href = URL.createObjectURL(resultFile)
      a.download = fileName
      a.click()
      URL.revokeObjectURL(a.href)
    }
  }
}
</script>

<style lang="scss">
.ui.container.fluid {
  position: relative;

  .img-file-upload {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    text-align: center;
    line-height: 1.6;
    letter-spacing: -.1px;
    font-size: 15px;
    color: #fff;

    button {
      margin: 16px 0;
      border-radius: 3px;
      border: solid 1px #e1e1e1 !important;
      background-color: #ffffff !important;
      box-shadow: none !important;
      color: #333 !important;
    }
  }
}
</style>