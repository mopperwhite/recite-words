<template lang="jade">
div
    h1.text-center
        | {{answer.test}}
    div(v-if="skipping")
        h3.text-center.text-success
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
            
            button.btn-warning.btn.btn-block(@click="skipping = true")
                    | 跳过
        div(v-else)
            div(v-if="ture_answer")
                h3.text-center.text-success
                    | 正确
            div(v-else)
                h3.text-center.text-danger
                    | 错误
                h3.text-center.text-muted.small
                    del
                        | {{wrong.answer}}
                    span
                        | ({{wrong.test}})
            h3.text-center.text-success
                | {{answer.answer}}
                span.small
                    | {{answer.counter}} / {{max_counter}}
            button.btn.btn-block.btn-success(@click="next_word")
                | 下一个
        span.process-bar-container.bg-muted.text-right
            div.text-left.process-bar.bg-success(:style = '`width: ${counter*100 / records.length}%;`')
                | {{counter}}
            | {{records.length - counter}}
        
    
</template>
<script>
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
        },
        next_word(){
            this.skipping= false
            this.guessing = true
            let records = this.records
                .map(e => {
                    e.counter = parseInt(
                        localStorage[
                        `item/${this.$route.params.id}/${e.test}:finished`]
                         || 0 )
                    return e
                }).filter(e => {
                    return e.counter < max_counter
                })
                     
            let stbe = []
            shuffle(records)
            this.answer = records[0]
            for(let i=0; i<4;i++){
                stbe.push(records[i])
            }
            shuffle(stbe)
            this.selectable = stbe
        },
    },
    created(){
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
button{
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