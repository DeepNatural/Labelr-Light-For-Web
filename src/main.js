import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueI18n from 'vue-i18n'
import { messages } from './i18n'
import components from './components/index'
import './styles/common.scss'
import emitter from './emitter'

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: 'ko',
  fallbackLocale: 'en',
  messages
})

Object.entries(components).forEach(([n, c]) => {
  Vue.component(n, c)
})

Object.defineProperty(Vue.prototype, '$evEmitter', {
  enumerable: false,
  get: () => emitter
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
