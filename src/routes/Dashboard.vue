<template lang="jade">
div.center-block.dashboard.container
  back-button
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
  firebase
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
