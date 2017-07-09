<template lang="jade">
div
    h1 合并项目
    .container
        .row
            div.form-group.col-xs-12
                label
                | 标题
                input.form-control(v-model="title")
        .row
            div.form-group.col-xs-12
                label
                    | 训练模式
                select.form-control(v-model="train_mode")
                    option(value="read-select")
                        | 阅读-选择
                    option(value="listen-select")
                        | 听词-选择
        .row
            div.form-group.col-xs-6
                label
                    | 测试语言
                select.form-control(v-model="test_lang")
                    template(v-for="v in languages")
                        option(:value="v")
                            | {{v}}
            div.form-group.col-xs-6
                label
                    | 答案语言
                select.form-control(v-model="answer_lang")
                    template(v-for="v in languages")
                        option(:value="v")
                            | {{v}}
        .row
            div.form-group.col-xs-12
                label
                    | 正确确认次数
                input.form-control(v-model="confirm_times", min=1, max=20, type="number")
    table.table#table
        tr
            th 标题
            th 进度
        tr( v-for="item in items",
            :class="{'bg-info': !item.selected, 'bg-warning': item.selected}",
            @click="item.selected = !item.selected")
            td {{item.title}}
            td {{item.count}}
    button.btn.btn-block.btn-primary(@click="submit")
        | 合并!
</template>
<script>
// import YAML from 'yaml'
import firebase from '../firebase'
import store from '../store'
export default {
    data () {
        return {
            test_lang: 'en-US',
            answer_lang: 'en-US',
            train_mode: 'read-select',
            languages: ['en-US','en-GB','zh-CN','zh-TW','ja-JP'],
            confirm_times: 2,
            title: '',
            items: []
        }
    },
    methods: {
        submit(){
            Promise.all(this.items.filter(i => i.selected).map(r => {
                return new Promise((resolve, reject) => {
                    let uid = store.state.firebase_user.uid
                    firebase
                        .database()
                        .ref(`/users/${uid}/datas/${r.data}`)
                        .on('value', snapshot => {
                            resolve(snapshot.val().records)
                        })
                })
            })).then(tests => {
                let records = {}
                tests.forEach(t => {
                    for(let x in t){
                        if(t[x].done) continue;
                        records[x] = Object.assign(t[x], {
                            done: false,
                            success_counter: 0,
                            failed_counter: 0,
                            skiped_counter: 0
                        })
                    }
                })
                let new_id = parseInt(localStorage['id_counter'] || 0)
                let item = {
                    id: new_id,
                    title: this.title,
                    counter: 0,
                    train_mode: this.train_mode,
                    confirm_times: this.confirm_times,
                    meta: {
                        lang: {
                            test: this.test_lang,
                            answer: this.answer_lang
                        }
                    }
                }
                
                let uid = store.state.firebase_user.uid
                let dref = firebase.database().ref(`/users/${uid}/datas`).push({
                    records
                })
                let iref = firebase.database().ref(`/users/${uid}/items`).push(item)
                iref.update({
                    id: iref.getKey(),
                    data: dref.getKey()
                })
                dref.update({
                    item: iref.getKey()
                })
                this.$router.push('/')
            })
        }
    },
    created () {
        let uid = store.state.firebase_user.uid
        firebase.database().ref(`/users/${uid}/items`).on('value', snapshot => {
            let val = snapshot.val()
            this.items = []
            for(let i in val){
      val[i].selected = false
      this.items.push(val[i])
            }
        })
    }
}
</script>
<style scoped>
#table, .btn{
    font-size: 2em;
}
</style>