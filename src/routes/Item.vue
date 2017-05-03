<template lang="jade">
div
    h4.text-warning.text-center(v-if="!voice")
        | 正在加载读音数据
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
                        | {{answer.counter}} / {{max_counter}}
                button.btn.btn-block.btn-success(@click="next_word")
                    | 下一个
                button.btn.btn-block.btn-danger(
                        :class="{'disabled': canceled}",
                        @click="cancel_this", 
                        v-if="ture_answer")
                    | 这是个意外！
    span.process-bar-container.bg-muted.text-right
        div.text-left.process-bar.bg-success(:style = '`width: ${counter*100 / records.length}%;`')
            | {{counter}}
        | {{records.length - counter}}
    div.form-group
        label(for="voiceSelect")
            | 选择声音
        select.form-control#voiceSelect(v-model = "voice_name", @change="voice = select_voices[voice_name], save_to_storage('config:voice', voice_name)")
            template(v-for="n in voices_names")
                option(:value = "n")
                    | {{n}}
    div.form-group
        label(for="voiceSelect")
            | 速度
        select.form-control#voiceSelect(v-model = "speech_rate", @change="save_to_storage('config:speech_rate', speech_rate)")
            option(:value = "1.0")
                | 正常
            option(:value = "0.75")
                | 略慢
            option(:value = "0.5")
                | 慢
            option(:value = "0.25")
                | 慢慢慢
</template>
<script>
import {youdao} from '../../keys.json'
import shuffle from 'shuffle-array'
const max_counter = 2
const options_num = 4
export default {
    data(){
        return {
            max_counter,
            answer: {},
            records: [],
            selectable: [],
            counter: parseInt(localStorage[`item/${this.$route.params.id}:counter`] || 0),
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
        }
    },
    methods: {
        save_to_storage(k, v){
            localStorage[k] = v
        },
        guess(gi){
            this.guessing = false
            let p = `item/${this.$route.params.id}/${this.answer.test}:finished`
            if(this.ture_answer = gi == this.answer){
                this.answer.counter ++
                localStorage[p] = this.answer.counter
                if(this.answer.counter >= max_counter){
                    localStorage[`item/${this.$route.params.id}:counter`] =
                        ++this.counter
                }
                this.canceled = false
            }else{
                this.wrong = gi
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
            utterThis.rate = this.speech_rate
            utterThis.voice = this.voice
            window.speechSynthesis.speak(utterThis);
        },
        try_again(){
            if(!confirm("将删除本项目下的所有进度记录\n确定？"))
                return;
            this.counter = 0
            delete localStorage[`item/${this.$route.params.id}:counter`]
            for(let e of this.records){
                delete localStorage[`item/${this.$route.params.id}/${e.test}:finished`]
            }
            this.records = JSON.parse(
                localStorage[`item/${this.$route.params.id}`]).data
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
                .map(e => {
                    e.counter = parseInt(
                        localStorage[
                        `item/${this.$route.params.id}/${e.test}:finished`]
                         || 0 )
                    return e
                }).filter(e => {
                    return e.counter < max_counter
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
        let intId = setInterval( () => {
            let vs = {}, vns = []
            for(let voice of speechSynthesis.getVoices()){
                if(voice.lang.match(/^en-/)) {
                    let name = `${voice.name}(${voice.lang})`
                    vns.push(name)
                    vs[name] = voice
                }
            }
            if(vns.length){
                console.log("FUVK")
                this.voice = vs[this.voice_name = localStorage['config:voice'] || vns[0]]
                this.select_voices = vs
                this.voices_names = vns
                clearInterval(intId)
            }
        }, 10)
        this.records = JSON.parse(
            localStorage[`item/${this.$route.params.id}`]).data
        this.next_word()
    }
}
</script>
<style scoped>
h1, h2, h3{
    color: white;
    font-size: 5em;
}
.btn{
    margin-y: 0.5em;
    font-size: 2em;
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