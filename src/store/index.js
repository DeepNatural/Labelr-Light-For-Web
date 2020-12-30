import Vue from 'vue'
import Vuex from 'vuex'
import annotationTool from './annotationTool'

Vue.use(Vuex)

const store = new Vuex.Store

store.registerModule('annotationTool', annotationTool)

export default store