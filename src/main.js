import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import Firebase from 'firebase'
import VueFire from 'vuefire'
import App from './App.vue'

import store from './store'
import router from './router'

Vue.use(VueRouter)
Vue.use(VueFire)
Vue.use(VueResource)

if(window.navigator.standalone){
  alert("googlechrome://" + window.location.host + window.location.pathname)
  window.location.href = "googlechrome://" + window.location.host + window.location.pathname
}

store.commit('initVoices')

new Vue({
  components: {
    App
  },
  router
}).$mount('#app')
