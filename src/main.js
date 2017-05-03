import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import Firebase from 'firebase'
import VueFire from 'vuefire'
import App from './App.vue'

import router from './router'

Vue.use(VueRouter)
Vue.use(VueFire)
Vue.use(VueResource)

new Vue({
  components: {
    App
  },
  router
}).$mount('#app')
