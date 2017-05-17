<template lang="jade">
div
    h3.text-center
      | 使用Firebase同步数据
    p.text-muted.text-center.small
      | 可能需要翻墙
    template(v-if="store.state.firebase_user")
      h4.text-center.text-success
        | Hello, {{store.state.firebase_user.email}}
      button.btn.btn-warning.btn-block(v-if="", @click="firebase_logout")
        | Logout
    template(v-else)
      div.form-group
        label(for='email') Email
        input.form-control(name="email", type='email', v-model='fb_email' placeholder='Email')
      div.form-group
        label(for='password') Password
        input.form-control(type='password', name='password', v-model="fb_pwd" placeholder='Password')
      button.btn.btn-primary.btn-block(@click="firebase_login(fb_email, fb_pwd)")
        | 登录
      button.btn.btn-info.btn-block(@click="firebase_register(fb_email, fb_pwd)")
        | 注册
</template>
<script>
import firebase from '../firebase'
import store from '../store'
export default {
    data () {
        return {
            store,
            fb_email: '',
            fb_pwd: ''
        }
    },
    methods: {
        firebase_login(email, password){
        store.dispatch('firebase_login', {email, password})
        },
        firebase_register(email, password){
        store.dispatch('firebase_register', {email, password})
        },
        firebase_logout(){
        store.dispatch('firebase_logout')
        }
    }
} 
</script>