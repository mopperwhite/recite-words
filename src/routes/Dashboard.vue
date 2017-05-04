<template lang="jade">
div.center-block.dashboard.container
  h1
    i.fa.fa-cog
    | Dashboard
  button.btn.btn-link.btn-block.btn-lg(@click="back")
    i.glyphicon.glyphicon-chevron-left
    | Back
  
  h3
    | 声音设置
  div.form-group
    label(for="voiceSelect")
      | 选择声音
    select.form-control#voiceSelect(v-model = "store.state.voice_name", @change="store.commit('set_voice', store.state.voice_name)")
      template(v-for="n in store.state.voice_list")
        option(:value = "n")
          | {{n}}
  div.form-group
    label(for="speedSelect")
      | 速度
    select.form-control#speedSelect(v-model = "store.state.speech_rate", @change="store.commit('set_speech_rate', store.state.speech_rate)")
      option(:value = "1.0")
        | 正常
      option(:value = "0.75")
        | 略慢
      option(:value = "0.5")
        | 慢
      option(:value = "0.25")
        | 慢慢慢

  template
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
        input.form-control(name="email", type='email', v-model='fb_email' placeholder='holder')
      div.form-group
        label(for='password') Password
        input.form-control(type='password', name='password', v-model="fb_pwd" placeholder='holder')
      button.btn.btn-primary.btn-block(@click="firebase_login(fb_email, fb_pwd)")
        | Login
      button.btn.btn-info.btn-block(@click="firebase_register(fb_email, fb_pwd)")
        | Create Account
</template>
<script>
import firebase from '../firebase'
import store from '../store'
export default {
  data () {
    return {
      store,
      auto_lock_flag: !!localStorage['autolock'],
      set_pwd_flag: false,
      fb_email: '',
      fb_pwd: ''
    }
  },
  methods: {
    back () {
      window.history.back()
    },
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
<style scoped>
.dashboard{
  width: 90%;
  font-size: 2em;
}
</style>
