<template lang="jade">
div
    div.form-group
        label
            | 标题
        input.form-control(v-model="title")
    div.form-group
        label
            | 数据格式
        select.form-control(v-model="data_type")
            option(value="json")
                | JSON
            option(value="csv")
                | CSV
            option(value="alternate")
                | 按行交替
    div.form-group
        label
            | 数据
        textarea.form-control(v-model="yaml_data", row=15)
    button.btn.btn-block.btn-primary(@click="submit")
        | 提交
</template>
<script>
// import YAML from 'yaml'
import firebase from '../firebase'
import store from '../store'
export default {
    data () {
        return {
            title: '',
            yaml_data: '',
            data_type: 'alternate',
            test_lang: 'en-US',
            answer_lang: 'en-US',
        }
    },
    methods: {
        submit(){
            let new_id = parseInt(localStorage['id_counter'] || 0)
            let data
            switch(this.data_type){
                case 'json':
                    data = JSON.parse(this.yaml_data)
                break
                case 'csv':
                    data = this.yaml_data
                        .split("\n")
                        .map(line =>{
                            let [test, answer] = line.split(/,|\t/)
                            return {test, answer}
                        })
                break
                case 'alternate':
                    data = []
                    let lines = this.yaml_data.split("\n")
                    for(let i=0; i<lines.length; i++){
                        if(i % 2){
                            data.push({
                                test: lines[i-1],
                                answer: lines[i]
                            })
                        }
                    }
                break
            }
            
            let item = {
                id: new_id,
                title: this.title,
                counter: 0,
                meta: {
                    lang: {
                        test: this.test_lang,
                        answer: this.answer_lang
                    }
                }
            }
            localStorage[`item/${new_id}`] = JSON.stringify(item)
            localStorage['id_counter'] = new_id + 1
            
            let records = {}
            data.forEach(r => {
                r.success_counter = 0
                r.failed_counter = 0
                records[r.test] = r
            })

            let uid = store.state.firebase_user.uid
            let iref = firebase.database().ref(`/users/${uid}/items`).push(item)
            let dref = firebase.database().ref(`/users/${uid}/datas`).push({
                records
            })
            iref.update({
                id: iref.getKey(),
                data: dref.getKey()
            })
            dref.update({
                item: iref.getKey()
            })
            this.$router.replace('/')
        }
    },
    created () {
    }
}
</script>