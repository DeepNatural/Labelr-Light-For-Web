import _ from 'lodash'
import { BaseAnnotationToolProps } from '@/utils/annotationTool'
import { renderDescriptionsAndInstructionDetail } from '@/utils/slots'
import { AnnotationToolMixin } from '@/mixin/annotationTool'

class ToolProps extends BaseAnnotationToolProps {
  context = {
    type: Object,
    default: () => ({
      id: '',
      title: '',
      writer: '',
      date: '',
      publisher: '',
      text: '',
    }),
  }
}

class Data {
  id = ''
  answer = ''

  constructor({ id, answer }) {
    this.id = id
    this.answer = answer ?? this.answer
  }

  toJSON() {
    const { id, answer } = this
    return { id, answer }
  }
}

const DNBook = {
  name: 'DNBook',

  mixins: [AnnotationToolMixin],

  data: () => ({
    tags: '',
  }),

  props: ToolProps.toScheme(),

  watch: {
    result: {
      deep: true,
      handler(result) {
        if (result instanceof Data && !this.loading)
          this._store().catch((err) => console.warn(err.message))
      },
    },

    skip: {
      deep: true,
      handler(skip) {
        this.tags = skip.checked ? skip.value : ''

        if (!this.loading)
          this._store().catch((err) => console.warn(err.message))
      },
    },

    storedResult(storedResult) {
      const { context, loading, isReviewer, isMonitoring } = this

      if (loading && (isReviewer || isMonitoring)) {
        /** @type {Data} */
        const data = storedResult.id ? storedResult : context
        this._setResult(this._copyObject(data))
      }
    },

    loading(loading) {
      if (!loading) {
        const skip = this.skip

        if (this.storedTags === skip.value) skip.checked = true
      }
    },

    context: {
      deep: true,
      handler() {
        const { context, storedResult } = this
        /** @type {Data} */
        const data = storedResult.id ? storedResult : context
        this._setResult(this._copyObject(data) ?? {})
      },
    },
  },

  methods: {
    _setResult(rawData) {
      this.result = new Data(rawData)
      this.initialize()
    },

    validator() {
      return (
        this.skip.checked ||
        (this.requiredCondition() && !this.isTooMuchLongAnswer())
      )
    },

    /**
     * 제출할 수 있는 조건을 계산합니다.
     * 요약문의 문장이 총 1개 이상 5개 이하인지를 계산하여 Boolean 값으로 리턴합니다.
     */
    requiredCondition() {
      return (
        1 <= this.countSentenceWithNewLine() &&
        this.countSentenceWithNewLine() < 5 &&
        !this.isSentenceEndWithoutEnter()
      )
    },

    /**
     * 마지막 문장을 제외한 요약문들의 갯수를 계산합니다.
     */
    countSentenceWithNewLine() {
      const {
        result: { answer },
      } = this

      const regex = /\.(?=(\s)?\s)/g
      let target = answer
      let count = 0
      let temp

      while ((temp = regex.exec(target))) count++

      return count
    },

    /**
     * 요약문의 끝인 온점(.)뒤에 개행 문자(\n)이외의 문자가 나오는지 확인합니다.
     */
    isSentenceEndWithoutEnter() {
      const {
        result: { answer },
      } = this
      const regex = /\.[^\s]/g

      return !!regex.exec(answer)
    },

    /**
     * 요약문의 길이가 원문의 30%를 넘는지 확인합니다.
     */
    isTooMuchLongAnswer() {
      const {
        context: { text },
        result: { answer },
      } = this

      return answer.length > text.length * 0.3
    },

    /**
     * 책에 대한 정보를 렌더링합니다.
     *
     * @param {import('vue').CreateElement} h
     */
    renderBookInfo(h) {
      const { widgets, context } = this

      return (
        <div>
          {widgets?.bookInfo.map((e) => {
            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 24px',
                  margin: '10px 0px',
                }}
              >
                <div
                  style={{
                    width: '100px',
                    height: '24px',
                    lineHeight: '1.6',
                    letterSpacing: '-0.1px',
                    fontWeight: '500',
                  }}
                >
                  {e.text}
                </div>
                <div
                  style={{
                    fontSize: '15px',
                    lineHeight: '1.6',
                    letterSpacing: '-0.1px',
                  }}
                >
                  {context[e.value]}
                </div>
              </div>
            )
          })}
        </div>
      )
    },

    /**
     * 책의 본문을 렌더링합니다.
     *
     * @param {import('vue').CreateElement} h
     */
    renderBookText(h) {
      const { context } = this

      return (
        <dn-ui-segment>
          <div style="padding: 10px 16px">
            <div style="font-size: 18px; font-weight: 500">문서원본</div>
            <div style="padding: 20px 0 10px 0; white-space: pre-wrap">
              {context.text}
            </div>
            <div style="font-size: 12px; float: right; color:#288aff">
              {context.text?.length || ''}
            </div>
          </div>
        </dn-ui-segment>
      )
    },

    /**
     * 책의 요약문을 입력할 수 있는 곳을 렌더링합니다.
     *
     * @param {import('vue').CreateElement} h
     */
    renderBookSummary(h) {
      const {
        result,
        skip: { checked },
      } = this

      const textareaStyle = {
        border: 'none',
        boxShadow: 'none',
        padding: '0 20px',
        height: '432px',
        lineHeight: '1.67',
      }

      return (
        <dn-ui-segment>
          <dn-ui-textarea
            textareaStyle={textareaStyle}
            v-model={result.answer}
            value={result.answer}
            maxLength={0}
            placeholder="입력해 주세요"
            disabled={checked}
          />
          {this.renderWarning(h)}
        </dn-ui-segment>
      )
    },

    /**
     * 유저가 입력한 값에 따라 경고문을 렌더링합니다.
     *
     * @param {import('vue').CreateElement} h
     */
    renderWarning(h) {
      return (
        <div style="color: red; text-align: right; font-size: 12px; margin-right: 5px;">
          {this.isSentenceEndWithoutEnter()
            ? '요약문을 살펴봐 주세요'
            : !this.requiredCondition()
            ? '1문장 이상 5문장 이하로 요약문을 작성해 주세요.'
            : this.isTooMuchLongAnswer()
            ? '요약 문장을 원문의 30% 이하로 요약해주세요'
            : ''}
        </div>
      )
    },
  },

  created() {
    this._setConfig({
      noEditByReviewMode: false,
    })

    this._setSkip({
      use: true,
      message: '레이블할 영역이 없습니다.',
      value: 'bad-data',
    })
  },

  /**
   *
   * @param @param {import('vue').CreateElement} h
   */
  render(h) {
    const { progress, hasRejectReason, config } = this

    return (
      <dn-annotation-layout-type-a
        progress={progress}
        has-reject-reason={hasRejectReason}
        config={config}
      >
        {...renderDescriptionsAndInstructionDetail(h, this.$slots.default)}
        <template slot="main">
          {this.renderBookText(h)}
          {this.renderBookSummary(h)}
        </template>

        <template slot="right-side">
          <dn-ui-segment no-padding>
            <dn-ui-section-header title="문서 정보" no-use-close />
            {this.renderBookInfo(h)}
          </dn-ui-segment>
        </template>
      </dn-annotation-layout-type-a>
    )
  },
}

export default DNBook
