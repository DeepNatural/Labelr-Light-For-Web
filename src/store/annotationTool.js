import _ from 'lodash'

class ResultHistory {
  index = -1

  /** @type {{ result, tags: string }[]} */
  list = []

  push({ result, tags }) {
    const { index, list } = this

    if(index !== list.length - 1) {
      list.splice(index + 1)
    }

    list.push({ result: _.cloneDeep(result), tags })

    this.index++
  }

  pop() {
    this.list.pop()
    this.index--
  }

  clear() {
    this.list = [ this.list[0] ]
    this.index = 0
  }
}

const fetchTheme = () => {
  return localStorage.getItem('DN_THEME') ?? 'day'
}

/** @type {import('vuex').Module<import('../types/store.annotationTool').AnnotationToolState<ResultHistory>>} */
const annotationTool = {
  namespaced: true,
  
  state: {
    theme: fetchTheme(),
    mode: 'task',
    result: {},
    tags: '',
    validator: () => true,
    taskRun: {
      uid: '',
      taskName: null,
      task: ''
    },
    resultHistory: new ResultHistory,
    skip: {
      use: true,
      message: 'SKIP',
      value: 'bad-data',
      checked: false
    },
    widgets: {},
  },

  getters: {
    isValid: ({ validator }) => validator(),
    isTaskMode: () => true
  },

  actions: {
    initialize(
      { commit, state },
      {
        result,
        validator,
        taskRun,
        widgets,
        skip
      }
    ) {
      commit('SET_RESULT', { result })
      commit('SET_SKIP', { ...state.skip, ...skip })
      commit('SET_VALIDATOR', { validator })
      commit('SET_TASKRUN', { taskRun })
      commit('SET_WIDGETS', { widgets })
    }
  },

  mutations: {
    SET_THEME(state, { theme }) {
      localStorage.setItem('DN_THEME', theme)
      
      state.theme = theme
    },

    SET_SKIP(state, { use, message, value, checked = false }) {
      state.skip = Object.assign(state.skip, { use, message, value, checked })
    },

    SET_RESULT(state, { result }) {
      state.result = _.cloneDeep(result)
    },

    SET_VALIDATOR(state, { validator }) {
      state.validator = () => validator(state.result)
    },

    SET_TASKRUN(state, { taskRun }) {
      state.taskRun = taskRun
    },

    SET_WIDGETS(state, { widgets }) {
      state.widgets = widgets
    },

    PUSH_RESULT_HISTORY({ resultHistory }, { result, tags }) {
      resultHistory.push({ result, tags })
    },

    POP_RESULT_HISTORY({ resultHistory }) {
      resultHistory.pop()
    },

    CLEAR_RESULT_HISTORY({ resultHistory }) {
      resultHistory.clear()
    },
  }
}

export default annotationTool
