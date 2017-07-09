import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import Firebase from 'firebase'
import VueFire from 'vuefire'
import App from './App.vue'

import store from './store'
import router from './router'
import bus from './bus'

Vue.use(VueRouter)
Vue.use(VueFire)
Vue.use(VueResource)

if(window.navigator.standalone){
  // alert("googlechrome://" + window.location.host + window.location.pathname)
  window.location.href = "googlechrome://" + window.location.host + window.location.pathname
}

document.addEventListener('keydown', ({ keyCode }) => {
  bus.$emit('keydown', {
    keyCode
  })
})

document.addEventListener('keyup', ({ keyCode }) => {
  bus.$emit('keyup', {
    keyCode
  })
})

store.commit('initVoices')

new Vue({
  components: {
    App
  },
  router
}).$mount('#app')
