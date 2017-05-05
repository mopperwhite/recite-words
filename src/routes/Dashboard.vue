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
        label(for="challengeMode")
          | 放飞自我模式
        input.form-control#challengeMode(
          type="checkbox", 
          v-model="store.state.free_mode",
          @change="store.commit('set_free_mode', store.state.free_mode)")
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
      store
    }
  },
  components: {
    Firebase,
    BackButton
  }
}
</script>
<style scoped>
.dashboard{
  width: 90%;
  font-size: 2em;
}
</style>
