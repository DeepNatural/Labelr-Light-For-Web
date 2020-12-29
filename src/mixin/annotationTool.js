import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import _ from 'lodash'
import { BaseAnnotationToolProps } from '../utils/annotationTool'

/**
 * @type {import('vue/types/umd').VueConstructor}
 */
export const AnnotationToolMixin = {
  data: () => ({
    loading: true,
    result: []
  }),

  props: BaseAnnotationToolProps.toScheme(),

  computed: {
    ...mapState('annotationTool', ['skip']),

    ...mapGetters('annotationTool', [
      'isTaskMode',
    ]),

    $dnAlert() {
      const $dnAlert = this.$children[0].$refs.$dnAlert

      return {
        show({ title, message, useDeny, buttonText }) {
          return $dnAlert.show({ title, message, useDeny, buttonText })
        },

        hide() {
          $dnAlert.hide()
        }
      }
    },
  },

  methods: {
    ...mapMutations('annotationTool', {
      setTheme: 'SET_THEME',
      _setSkip: 'SET_SKIP'
    }),

    ...mapActions('annotationTool', {
      _initialize: 'initialize'
    }),

    validator() { return true },

    _refresh() {
      return this._request({
        action: 'refresh'
      })
    },

    _store() {
      if(this.isTaskMode && !this.loading) {
        return this._request({
          action: 'store',
          payload: {
            result: this.result.toJSON ? this.result.toJSON() : this.result,
            tags: this.tags ?? ''
          }
        })
      }

      return Promise.reject(new Error('작업자 모드에서만 자동저장이 됩니다.'))
    },

    _submit() {
      if(this.isTaskMode) {
        const { skip: { checked }, result } = this
        const resultToBeSubmitted = !result.toJSON ? result : result.toJSON()

        return this._request({
          action: 'submit',
          payload: {
            result: checked ? {} : resultToBeSubmitted,
            tags: this.tags ?? ''
          }
        })
      }

      return Promise.reject(new Error('작업자 모드에서만 제출이 가능합니다.'))
    },

    /**
     * @param {File[]} files 
     */
    _uploadFiles(files) {
      return this._request({
        action: 'uploadFiles',
        payload: { files }
      })
    },

    _exit() {
      return this._request({
        action: 'exit'
      })
    },

    _copyObject(value) {
      return _.cloneDeep(value)
    },

    _setConfig(config) {
      this.$emit('config', config)
    },

    initialize() {
      const {
        result,
        validator,
        taskRun,
        theme,
        widgets,
        skipMessage,
        noSkip,
      } = this

      theme && this.setTheme({ theme })
      
      this._initialize({
        result,
        validator,
        taskRun,
        mode: this._getMode(),
        widgets,
        skip: { checked: false, message: skipMessage, use: !noSkip }
      })
    },

    _request({ action, payload }) {
      return new Promise((resolve, reject) => {
        const id = `DN@${(_.random(1e14, 1e15 - 1)).toString(32)}`

        this.$emit('request', { action, payload, id })

        this.$evEmitter.once(id, res => {
          if (res?.error) {
            let error = res.error

            console.warn(error)

            if(error.data) {
              error = new Error(Object.values(error.data).flat()[0])
            }

            reject(error)
          }
          else resolve(res)
        })
      })
    },

    _getMode() {
      const { params: { mode } } = this.$route

      return mode ?? 'task'
    }
  },

  created() {
    const { types } = this.$evEmitter

    this.$evEmitter.on(types.ACTION, args => {
      let actionName = ''
      let payload = {}

      if(typeof args === 'string') actionName = args
      else {
        actionName = args.action
        payload = args.payload
      }

      console.debug(`[evEmitter][${actionName}][${JSON.stringify(payload)}]`)

      this[`_${actionName}`](payload)
    })
  },

  mounted() {
    setTimeout(() => {
      this.loading = false
      this.initialize()
    }, 1000)
  }
}
