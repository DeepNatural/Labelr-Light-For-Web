<template>
  <div class="ui container fluid" :class="theme">
    <dn-annotation-tool-image-annotation
      no-skip
      :context="context"
      :widgets="widgets"
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
    </dn-annotation-tool-image-annotation>

    <div
      v-if="!context.url"
      class="flex items-center justify-center img-file-upload"
    >
      <div>
        <div>이미지를 업로드 하세요</div>
        <dn-ui-button :file="{ accept: 'image/*' }" @inputFile="onInputFile">
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
      url: null,
    },
    result: {},
    widgets: {
      handleSize: 12,
      tagFontSize: 18,
      instanceSpec: {
        minCount: 1,
        maxCount: 100,
        name: '개체',
        countPerAnnotationName: {
          박스: 1,
          체장선: 1,
          체고선: 1,
        },
      },
      annotationSpecs: [
        {
          type: 'bbox',
          name: '박스',
          icon: '',
          strokeWidth: 2,
          color: '#00ff00',
          minWidth: 50,
          minHeight: 50,
        },
        {
          type: 'polyline',
          name: '체장선',
          icon: '',
          length: 2,
          strokeWidth: 2,
          color: '#ff0000',
          handleFillColor: '#ffffff',
          handleFontColor: '#ff0000',
        },
        {
          type: 'polyline',
          name: '체고선',
          icon: '',
          length: 2,
          strokeWidth: 2,
          color: '#0000ff',
          handleFillColor: '#ffffff',
          handleFontColor: '#0000ff',
        },
      ],
    },
  }),

  computed: {
    theme() {
      return this.$store.state.annotationTool.theme
    },
  },

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
      const resultFile = new File([JSON.stringify(result)], fileName, {
        type: 'application/json',
      })
      a.href = URL.createObjectURL(resultFile)
      a.download = fileName
      a.click()
      URL.revokeObjectURL(a.href)
    },
  },
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
    letter-spacing: -0.1px;
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
