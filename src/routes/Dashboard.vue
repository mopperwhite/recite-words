<template lang="jade">
div.center-block.dashboard.container
  back-button
  div.container
    div.row
      div.form-group.col-xs-12.col-ms-12
        label(for="voiceSelect")
          | 选择声音
        select.form-control#voiceSelect(v-model = "store.state.voice_name", @change="store.commit('set_voice', store.state.voice_name)")
          template(v-for="n in store.state.voice_list")
            option(:value = "n")
              | {{n}}
    div.row
      div.form-group.col-xs-12.col-ms-12
        label(for="freeMode") 飞行模式
        select.form-control#freeMode(v-model="challenge_mode", @change="fly")
          option(value = 'normal')
            | 休闲模式
          option(value = 'free_mode')
            | 放飞自我
          option(value = 'hard_mode')
            | 送你上天
    h5.text-muted
      | {{challenge_mode_description}}
    div.row
      div.form-group.col-xs-12.col-ms-12
        label(for="speedSelect")
          | 速度
        select.form-control#speedSelect(v-model = "store.state.speech_rate", @change="store.commit('set_speech_rate', store.state.speech_rate)")
          option(:value = "3.0")
            | 红色有角
          option(:value = "2.0")
            | 快━━━(゜∀゜)♥━━━!!!!! 
          option(:value = "1.5")
            | 快
          option(:value = "1.0")
            | 正常
          option(:value = "0.75")
            | 略慢
          option(:value = "0.5")
            | 慢
          option(:value = "0.25")
            | 慢(((( ；ﾟДﾟ)))
    div.row
      firebase.col-xs-12.col-ms-12
</template>
<script>
import store from '../store'
import Firebase from '../components/Firebase.vue'
import BackButton from '../components/BackButton.vue'
export default {
  data () {
    return {
      store,
      challenge_mode: ['normal', 'free_mode', '', 'hard_mode'][ store.state.hard_mode << 1 | store.state.free_mode ],
      challenge_mode_description: '',
    }
  },
  components: {
    Firebase,
    BackButton
  },
  methods: {
    fly(){
      switch(this.challenge_mode){
      case 'normal':
        store.commit('set_free_mode', false)
        store.commit('set_hard_mode', false)
        this.challenge_mode_description= "恣意游玩"
      break
      case 'free_mode':
        store.commit('set_free_mode', true)
        store.commit('set_hard_mode', false)
        this.challenge_mode_description= "你将有3秒时间认出一个单词"
      break
      case 'hard_mode':
        store.commit('set_free_mode', true)
        store.commit('set_hard_mode', true)
        this.challenge_mode_description= "你将有3秒时间认出一个单词，并且只有1秒进行选择"
      break
      }
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
