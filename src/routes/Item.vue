<template lang="jade">
div
    h4.text-warning.text-center(v-if="!store.state.voice")
        | 正在加载读音数据
    h4.text-warning.text-center(v-if="loading_data")
        | 正在加载项目
    template(v-else)
        h1.text-center(@click="translate(answer.test)")
            | {{answer.test}}
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
            h2.text-danger
                | 已经，没有更多了
            button.btn.btn-block.btn-danger(@click="try_again")
                | 再来一次?
        template(v-else)
            div(v-if="skipping")
                h3.text-center.text-success(@click="translate(answer.answer)")
                    | {{answer.answer}}
                    span.small
                        | {{answer.counter}} / {{max_counter}}
                button.btn.btn-block.btn-success(@click="next_word")
                        | 下一个
            template(v-else)
                div(v-if="guessing")
                    template(v-for="st in selectable")
                        button.btn.btn-block.btn-default(@click="guess(st)")
                            | {{st && st.answer}}
                    
                    button.btn-warning.btn.btn-block(@click="speak(answer.answer), skipping = true")
                            | 跳过
                div(v-else)
                    div(v-if="ture_answer")
                        h3.text-center.text-success
                            | 正确
                    div(v-else)
                        h3.text-center.text-danger
                            | 错误
                        h3.text-center.text-muted.small
                            del(@click="translate(wrong.answer)")
                                | {{wrong.answer}}
                            span(@click="translate(wrong.test)")
                                | ({{wrong.test}})
                    h3.text-center.text-success(@click="translate(answer.answer)")
                        | {{answer.answer}}
                        br
                        span.small
                            | {{answer.success_counter}} / {{max_counter}}
                    button.btn.btn-block.btn-success(@click="next_word")
                        | 下一个
                    button.btn.btn-block.btn-danger(
                            :class="{'disabled': canceled}",
                            @click="cancel_this", 
                            v-if="ture_answer")
                        | 这是个意外！
        span.process-bar-container.bg-muted.text-right
            div.text-left.process-bar.bg-success(:style = '`width: ${item.counter*100 / records.length}%;`')
                | {{item.counter}}
            | {{records.length - item.counter}}
    
</template>
<script>
import store from '../store'
import {youdao} from '../../keys.json'
import shuffle from 'shuffle-array'
import firebase from '../firebase'
const max_counter = 2
const options_num = 4
export default {
    data(){
        return {
            store,
            max_counter,
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
                "title" : ""
            },
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
            loading_data: true
        }
    },
    methods: {
        save_to_storage(k, v){
            localStorage[k] = v
        },
        guess(gi){
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
                if(this.answer.success_counter >= max_counter){
                    this.item.counter ++
                    this.item_ref.update({
                        counter: this.item.counter
                    })
                }
                this.canceled = false
            }else{
                this.wrong = gi
                this.answer.failed_counter ++
                db.ref(p).update({
                    failed_counter: this.answer.failed_counter
                })
            }
            this.speak(this.answer.answer)
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
        speak(text){
            if(!this.spaekingEnabled || !window.SpeechSynthesisUtterance) return;
            let utterThis = new window.SpeechSynthesisUtterance(text);
            utterThis.lang = 'en-US' // 结果只要改语言就能正常！！！
            utterThis.rate = this.store.state.speech_rate
            utterThis.voice = this.store.state.voice
            window.speechSynthesis.speak(utterThis);
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
                r.success_counter =
                r.failed_counter  = 0
                let p = `/users/${uid}/datas/${this.item.data}/records/${r.test}`
                db.ref(p).update({
                    success_counter: 0,
                    failed_counter: 0
                })
            }
            this.the_last_one = false
            this.next_word()
        },
        cancel_this(){
            let p = `item/${this.$route.params.id}/${this.answer.test}:finished`
            if(this.answer.counter >= max_counter){
                    localStorage[`item/${this.$route.params.id}:counter`] =
                        --this.counter
            }
            this.answer.counter --
            localStorage[p] = this.answer.counter
            this.canceled = true
        },
        next_word(){
            this.translation = null
            this.skipping= false
            this.guessing = true
            let may_next = this.records
                .filter(e => {
                    return e.success_counter < max_counter
                })
            if(may_next.length == 0){
                this.the_last_one = true
                return
            }
            this.answer = may_next[Math.floor(Math.random() * may_next.length)]
            let records = this.records.filter(e => {
                return e.test != this.answer.test && e.answer != this.answer.answer 
            })
                     
            let stbe = [this.answer]
            shuffle(records)
            for(let i=0; i<Math.min(records.length, options_num - 1);i++){
                stbe.push(records[i])
            }
            shuffle(stbe)
            this.selectable = stbe
            this.speak(this.answer.test)
        },
    },
    created(){
        // this.records = JSON.parse(
        //     localStorage[`item/${this.$route.params.id}`]).data
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
                        this.records.push(rs[r])
                        db.ref(`/users/${uid}/datas/${item.data}/records/${r}`)
                            .on('value', nsnap => {
                                let nr = nsnap.val()
                                rs[r].success_counter = nr.success_counter
                                rs[r].failed_counter  = nr.failed_counter
                            })
                    }
                    this.loading_data = false
                    this.next_word()
                })
        })
        this.item_ref.on('value', (snap) => {
            this.item = snap.val()
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
h1, h2, h3{
    color: white;
    font-size: 5em;
}
.btn{
    margin-y: 0.8em;
}
.process-bar-container{
    display: block;
    width: 100%;
    height: 2em;
    left: 0;
    bottom: 0;
    position: fixed;
}
.process-bar{
    height: 2em;
    left: 0;
    top: 0;
    position: absolute;
}
</style>