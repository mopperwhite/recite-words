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
        span.process-bar-container.bg-muted.text-right
            div.text-left.process-bar.bg-success(:style = '`width: ${counter*100 / records.length}%;`')
                | {{counter}}
            | {{records.length - counter}}
    div.form-group
        label(for="voiceSelect")
            | 选择声音
        select.form-control#voiceSelect(v-model = "voice_name", @change="voice = select_voices[voice_name]")
            template(v-for="n in voices_names")
                option(:value = "n")
                    | {{n}}
    div.form-group
        label(for="voiceSelect")
            | 速度
        select.form-control#voiceSelect(v-model = "speech_rate")
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
            speech_rate: 1.0,
        }
    },
    methods: {
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
            this.answer = may_next[Math.floor(Math.random() * may_next.length)]
            let records = this.records.filter(e => {
                return e.test != this.answer.test && e.answer != this.answer.answer 
            })
                     
            let stbe = [this.answer]
            shuffle(records)
            for(let i=0; i<3;i++){
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
                this.voice = vs[this.voice_name = vns[0]]
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
    position: relative;
}
.process-bar{
    height: 2em;
    left: 0;
    top: 0;
    position: absolute;
}
</style>