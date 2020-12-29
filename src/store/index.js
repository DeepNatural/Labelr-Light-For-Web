import Vue from 'vue'
import Vuex from 'vuex'
import annotationTool from './annotationTool'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    intercom: { namespaced: true }
  }
})

store.registerModule('annotationTool', annotationTool)

export default store