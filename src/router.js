import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

import Home from './routes/Home.vue'
import AddItem from './routes/AddItem.vue'
import Item from './routes/Item.vue'
import Dashboard from './routes/Dashboard.vue'

const routes = [
  { path: '/', component: Home},
  { path: '/item/:id', component: Item},
  { path: '/additem', component: AddItem},
  { path: '/dashboard', component: Dashboard}
]

const router = new VueRouter({routes})
export default router
