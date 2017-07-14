<template lang="jade">
div
  h4.text-warning.text-center(v-if="!store.state.voice")
    | 正在加载读音数据
  h4.text-warning.text-center(v-if="loading_data")
    | 正在加载项目
  template(v-else)
    h1.text-center.answer(
      @click="translate(answer.test)",
      v-if="!guessing || item.train_mode=='read-select'")
      | {{answer.test}}
    h1.text-center.answer(v-else)
      i.fa.fa-headphones
    div.bg-info(v-if="translation != null")
      template(v-if="translation")
        h4.muted
          | {{translation.query}}
        h4
          | {{translation.translation}}
        div(v-html="translation.explain")
      template(v-else)
        h4.bg-warning
          | 未找到
    template(v-if="the_last_one")
      h2.text-danger.status
        | 已经，没有更多了
      button.btn.btn-block.btn-danger(@click="try_again")
        | 再来一次?
    template(v-else)
      div(v-if="skipping")
        h3.text-center.text-success.answer(@click="translate(answer.answer)")
          | {{answer.answer}}
        h5.small
          | {{answer.success_counter}} / {{item.confirm_times}}
        button.btn.btn-block.btn-success(@click="next_word")
          | 下一个
      template(v-else)
        div(v-if="guessing")
          template(v-for="st in selectable", v-if="!store.state.free_mode || !store.state.hard_mode || remain_time < 33")
            button.btn.btn-block.btn-default(@click="guess(st)")
              | {{st && st.answer}}
          template(v-else)
            h3.muted
              i.fa.fa-clock-o
          span.process-bar-container.bg-muted.time-bar(v-if="store.state.free_mode")
            div.text-left.process-bar.bg-warning(:style = '`width: ${remain_time}%;`')
          button.btn-warning.btn.btn-block(@click="skip()")
              | 跳过
        div(v-else)
          div(v-if="ture_answer")
            h3.text-center.text-success.status
              | 正确
          div(v-else)
            h3.text-center.text-danger.status
              | 错误
            h3.text-center.text-muted.small.mistake
              del(@click="translate(wrong.answer)")
                | {{wrong.answer}}
              span(@click="translate(wrong.test)")
                | ({{wrong.test}})
          h3.text-center.text-success.answer(@click="translate(answer.answer)")
            | {{answer.answer}}
          h5.small
            | {{answer.success_counter}} / {{item.confirm_times}}
          button.btn.btn-block.btn-success(@click="next_word")
            | 下一个
          button.btn.btn-block.btn-danger(
              :class="{'disabled': canceled}",
              @click="cancel_this", 
              v-if="ture_answer")
            | 这是个意外！
    button.btn.btn-block.btn-link.above-table(@click="show_table = !show_table")
      | {{show_table ? "Hide Records" : "Show Records"}}
    .container-fluid#table(v-if="show_table")
      .row
        input.col-xs-12(v-model="table_search")
      .row
        button.col-xs-6.btn.btn-success(@click="set_all_test_as(false)") 全部使用
        button.col-xs-6.btn.btn-danger(@click="set_all_test_as(true)") 全部隐藏
      table.table
        tr
          th 原词
          th 翻译
          th 成功
          th 跳过
          th 错误
        tr(
            v-for="(r, index) in order_by_failed(records)"
            @click="on_test_click(r, !r.done, index)",
            :class="{'bg-success': !r.done, 'bg-danger': r.done}")
            td {{r.test}}
            td {{r.answer}}
            td {{r.success_counter}}
            td {{r.skiped_counter}}
            td {{r.failed_counter}}
      button.btn.btn-block.btn-danger(@click="delete_self") 删除本项目
    span.process-bar-container.bg-muted.text-right.counter-bar
      div.text-left.process-bar.bg-success(:style = '`width: ${item.counter*100 / length}%;`')
        | {{item.counter}}
      | {{length - item.counter}}
  
</template>
<script>
import store from '../store'
import {youdao} from '../../keys.json'
import shuffle from 'shuffle-array'
import firebase from '../firebase'
import classify_words from '../classify-words'
import bus from '../bus'
const options_num = 4
export default {
  data(){
    return {
      store,
      show_table: false,
      item: {
        "counter" : 0,
        "data" : "",
        "id" : "",
        "meta" : {
          "lang" : {
          "answer" : "en-US",
          "test" : "en-US"
          }
        },
        "title" : "",
        confirm_times: 2,
      },
      length: 1,
      utter: null,
      table_search: '',
      shift_select:{
        selecting: false,
        start: -1,
        target: false
      },
      remain_time: 100,
      answer: {},
      records: [],
      selectable: [],
      guessing: true,
      ture_answer: false,
      wrong: '',
      skipping: false,
      voice: null,
      spaekingEnabled: true,
      translation: null,
      voices_names: [],
      select_voices: {},
      voice_name: '',
      speech_rate:  parseFloat(localStorage['config:speech_rate'] || 1.0),
      the_last_one: false,
      canceled: true,
      item_ref: null,
      loading_data: true,
      free_mode_interval: null
    }
  },
  methods: {
    set_all_test_as(done){
      for(let r of this.records){
        this.set_done(r, done)
      }
    },
    order_by_failed(records){
      let arr = records.slice()
      if(this.table_search){
        let re = new RegExp(this.table_search)
        arr = arr.filter(r => {
          return r.test.match(re) || r.answer.match(re)
        })
      }
      return arr.sort((a, b) => {
        return -(
          (a.skiped_counter + a.failed_counter)
            -
          (b.skiped_counter + b.failed_counter)
        )
      })
    },
    save_to_storage(k, v){
      localStorage[k] = v
    },
    delete_self(){
      let uid = store.state.firebase_user.uid
      let db = firebase.database()
      let id = this.$route.params.id
      let ip = `/users/${uid}/items/${id}`
      let dp = `/users/${uid}/datas/${this.item.data}`
      if(confirm('将删除本项目的所有数据，确定吗？'))
        Promise.all([ip, dp].map(p => 
          new Promise(resolve => 
            db.ref(p).remove()
            .then(() => {
              resolve()
            })))).then(results => {
              this.$router.push('/')
            })
    },
    skip(){
      let uid = store.state.firebase_user.uid
      let db = firebase.database()
      let id = this.$route.params.id
      let p = `/users/${uid}/datas/${this.item.data}/records/${this.answer.test}`
      this.speak(this.answer.answer, this.item.meta.lang.answer)
      this.answer.skiped_counter++
      db.ref(p).update({
        skiped_counter: this.answer.skiped_counter
      })
      this.skipping = true
      this.guessing = false
      if(this.free_mode_interval){
        clearInterval(this.free_mode_interval)
      }
    },
    on_test_click(answer, done, index){
      this.set_done(answer, done)
      if(this.shift_select.selecting){
        if(this.shift_select.start == -1){
          this.shift_select.target = done
          this.shift_select.start = index
        }else{
          this
            .order_by_failed(this.records)
            .slice(this.shift_select.start, index + 1)
            .forEach(r => {
              this.set_done(r, this.shift_select.target)
            })
          this.shift_select.start = -1
          this.shift_select.selecting = false
        }
      }
    },
    set_done(answer, done){
      let db = firebase.database()
      let uid = store.state.firebase_user.uid
      let p = `/users/${uid}/datas/${this.item.data}/records/${answer.test}`
      db.ref(p).update({ done })
      answer.done = done
    },
    guess(gi){
      if(this.free_mode_interval){
        clearInterval(this.free_mode_interval)
      }
      this.guessing = false
      let uid = store.state.firebase_user.uid
      let db = firebase.database()
      let id = this.$route.params.id
      let p = `/users/${uid}/datas/${this.item.data}/records/${this.answer.test}`
      if(this.ture_answer = gi == this.answer){
        this.answer.success_counter ++
        db.ref(p).update({
          success_counter: this.answer.success_counter
        })
        if(this.answer.success_counter >= this.item.confirm_times){
          this.item.counter ++
          this.item_ref.update({
            counter: this.item.counter
          })
        }
        this.canceled = false
      }else{
        this.wrong = gi
        this.answer.failed_counter ++
        this.answer.success_counter = 0
        db.ref(p).update({
          failed_counter: this.answer.failed_counter,
          success_counter: 0,
        })
      }
      this.speak(this.answer.answer, this.item.meta.lang.answer)
    },
    translate (text) {
      this.$http.jsonp(`http://fanyi.youdao.com/openapi.do?keyfrom=${youdao.keyfrom}&key=${youdao.key}&type=data&doctype=jsonp&version=1.1&q=${encodeURI(text)}`)
        .then(res => res.json())
        .then(res => {
          this.translation = {
            query: res.query,
            translation: res.translation.join("/"),
            explain: res.basic && res.basic.explains && res.basic.explains.join("\n<br/>\n") || ''
          }
        })
    },
    speak(text, lang){
      if(!this.spaekingEnabled || !window.SpeechSynthesisUtterance) return;
      let utterThis = new window.SpeechSynthesisUtterance(text);
      utterThis.lang = lang // 结果只要改语言就能正常！！！
      utterThis.rate = this.store.state.speech_rate
      // utterThis.voice = this.store.state.voice
      this.utter = utterThis
      window.speechSynthesis.speak(utterThis)
    },
    try_again(){
      let uid = store.state.firebase_user.uid
      let db = firebase.database()
      let id = this.$route.params.id
      if(!confirm("将删除本项目下的所有进度记录\n确定？"))
        return;
      this.item.counter = 0
      this.item_ref.update({counter: 0})
      for(let r of this.records){
        r.success_counter = 0
        // r.failed_counter  = 0
        let p = `/users/${uid}/datas/${this.item.data}/records/${r.test}`
        db.ref(p).update({
          success_counter: 0,
          // failed_counter: 0
        })
      }
      this.the_last_one = false
      this.next_word()
    },
    cancel_this(){
      let uid = store.state.firebase_user.uid
      let db = firebase.database()
      let id = this.$route.params.id
      if(this.answer.success_counter >= this.item.confirm_times){
        this.item_ref.update({counter: --this.item.counter})
      } 
      this.canceled = true
      db.ref(`/users/${uid}/datas/${this.item.data}/records/${this.answer.test}`)
        .update({
          success_counter: --this.answer.success_counter
        })
    },
    next_word(){
      window.speechSynthesis.cancel()
      let may_next = this.records
        .filter(e => {
          return !e.done && e.success_counter < this.item.confirm_times
        })
      this.length = this.records.filter(e => !e.done).length
      this.item.counter = this.records.filter(e => 
        e.success_counter === this.item.confirm_times &&
        !e.done).length
      console.log(this.length, this.item.counter)
      if(may_next.length == 0){
        this.the_last_one = true
        return
      }
      this.answer = may_next[Math.floor(Math.random() * may_next.length)]
      let records = this.records.filter(e => {
        return e.test != this.answer.test && e.answer != this.answer.answer 
      })
      let records_group
      if(this.item.meta.lang.answer.match(/^en/)){
        records_group = classify_words.en(this.answer, records, 'answer')
      }else if(this.item.meta.lang.test.match(/^en/)){
        records_group = classify_words.en(this.answer, records, 'answer')
      }else{
        records_group = classify_words.other(this.answer, records)

      }
      let rest_counter = this.item.confirm_times
      let stbe = [this.answer]
      for(let i = 0; rest_counter > 0 && i < records_group.length; i++){
        let group = records_group[i]
        let dlen  = Math.min(group.length, rest_counter)
        shuffle(group)
        stbe = stbe.concat( group.slice(0, dlen+1) )
        rest_counter -= dlen
      }
      shuffle(stbe)
      this.selectable = stbe
      this.speak(this.answer.test, this.item.meta.lang.test)
      this.translation = null
      this.skipping= false
      this.guessing = true
      if(this.store.state.free_mode){
        this.remain_time = 100
        this.free_mode_interval = setInterval(() => {
          this.remain_time-=0.5
          if(!this.remain_time){
            this.skip()
            this.remain_time = 100
          }
        }, 20)
      }
    },
  },
  created(){
    // this.records = JSON.parse(
    //   localStorage[`item/${this.$route.params.id}`]).data
    let uid = store.state.firebase_user.uid
    let db = firebase.database()
    let id = this.$route.params.id
    this.item_ref = db.ref(`/users/${uid}/items/${id}`)
    this.item_ref.once('value', (isnap) => {
      let item = isnap.val()
      db.ref(`/users/${uid}/datas/${item.data}`)
        .once('value', (dsnap) => {
          let rs = dsnap.val().records
          for(let r in rs){
            let rv = rs[r]
            if(typeof(rv.done) === 'undefined'){
              rv.done = false
            }
            this.records.push(rv)
            db.ref(`/users/${uid}/datas/${item.data}/records/${r}`)
              .on('value', nsnap => {
                let nr = nsnap.val()
                rv.success_counter = nr.success_counter
                rv.failed_counter  = nr.failed_counter
              })
          }
          this.loading_data = false
          this.next_word()
        })
    })
    this.item_ref.on('value', (snap) => {
      this.item = snap.val()
    })
    bus.$on('keydown', ({keyCode}) => {
      console.log(keyCode)
      if(keyCode == 16 && !this.shift_select.selecting){
        this.shift_select.selecting = true
      }else if(keyCode >= 49 && keyCode < 49+this.selectable.length){
        this.guess(this.selectable[keyCode - 49])
      }else if(keyCode == 83){
        if(this.guessing){
          this.skip()
        }else{
          this.next_word()
        }
      }
    })
  }
}
</script>
<style scoped>
.btn{
  font-size: 1.5em;
}
select{
  height: 2em;
}
@media (pointer:coarse){
  .btn{
    font-size: 2em;
  }
}
.status, .answer, .mistake{
  color: white;
}
.status, .answer{
  font-size: 5em;
}
.mistake{
  font-size: 3em;
}
.btn{
  margin-y: 0.8em;
}
.counter-bar{
  bottom: 0;
  position: fixed;
  display: block;
}
.time-bar{
  position: relative;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
.process-bar-container{
  width: 100%;
  height: 2em;
  left: 0;
  display: block;
}
.process-bar{
  height: 2em;
  left: 0;
  top: 0;
  position: absolute;
}
.above-table{
  margin-top: 5em;
  margin-bottom: 1em;
}
#table > * {
  margin-top: 1em;
  margin-bottom: 1em;
}
#table input{
  font-size: 2em;
  text-align: center;
}
@media (max-width: 500px){
  .answer{
    font-size: 3em;
  }
  .mistake{
    font-size: 1.5em;
  }
}

</style>