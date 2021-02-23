<template>
  <div class="ui container fluid" :class="theme">
    <dn-annotation-tool-book no-skip :context="context" :widgets="widgets" @request="onRequest">
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
    </dn-annotation-tool-book>
    <div v-if="!context.title" class="flex items-center justify-center img-file-upload">
      <div>
        <div>책 정보가 담긴 JSON을 업로드 하세요</div>
        <dn-ui-button :file="{ accept: 'application/JSON' }" @inputFile="onInputFile">JSON 파일찾기</dn-ui-button>
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
      title: '',
      writer: '',
      date: '',
      publisher: '',
      text: '',
    },
    result: {},
    widgets: {
      bookInfo: [
        {
          text: '도서제목',
          value: 'title',
        },
        {
          text: '저자',
          value: 'writer',
        },
        {
          text: '발행일',
          value: 'date',
        },
        {
          text: '발행기관',
          value: 'publisher',
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

    onInputFile({ target: { files } }) {
      if (!files.length) return

      let json
      let reader = new FileReader()

      reader.readAsText(files[0])

      reader.onload = ({ target: { result } }) => {
        json = JSON.parse(result)

        this.context = { ...json }
      }
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
