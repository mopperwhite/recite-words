import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

import Home from './routes/Home.vue'
import AddItem from './routes/AddItem.vue'
import Item from './routes/Item.vue'
import Dashboard from './routes/Dashboard.vue'
import Account from './routes/Account.vue'
import Index from './routes/Index.vue'
import MergeItems from './routes/MergeItems.vue'

import firebase from './firebase'

const routes = [
  { path: '/', redirect: '/home'},
  { path: '/home', component: Home},
  { path: '/item/:id', component: Item},
  { path: '/additem', component: AddItem},
  { path: '/dashboard', component: Dashboard},
  { path: '/account', component: Account},
  { path: '/merge', component: MergeItems},
]

const router = new VueRouter({routes})
export default router
