<template lang="jade">
div
    h1.text-center
        | 添加项目
    div.container
        div.row
            div.form-group.col-xs-12.col-ms-12
                label
                    | 标题
                input.form-control(v-model="title")
        div.row
            div.form-group.col-xs-12.col-ms-12
                label
                    | 数据格式
                select.form-control(v-model="data_type")
                    option(value="json")
                        | JSON(从软件导入)
                    option(value="csv")
                        | CSV(从电子表格复制)
                    option(value="alternate")
                        | 按行交替(便于手动输入)
        div.row
            div.form-group.col-xs-12.col-ms-12
                label
                    | 数据
                textarea.form-control(v-model="yaml_data", row=15)
        div.row
            div.form-group.col-xs-12.col-ms-12
                label
                    | 训练模式
                select.form-control(v-model="train_mode")
                    option(value="read-select")
                        | 阅读-选择
                    option(value="listen-select")
                        | 听词-选择
        div.row
            div.form-group.col-xs-6.col-ms-6
                label
                    | 测试语言
                select.form-control(v-model="test_lang")
                    template(v-for="v in languages")
                        option(:value="v")
                            | {{v}}
            div.form-group.col-xs-6.col-ms-6
                label
                    | 答案语言
                select.form-control(v-model="answer_lang")
                    template(v-for="v in languages")
                        option(:value="v")
                            | {{v}}
        div.row
            div.form-group.col-xs-12.col-ms-12
                label
                    | 正确确认次数
                input.form-control(v-model="confirm_times", min=1, max=20, type="number")
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
            data_type: 'csv',
            test_lang: 'en-US',
            answer_lang: 'en-US',
            train_mode: 'read-select',
            languages: ['en-US','en-GB','zh-CN','zh-TW','ja-JP'],
            confirm_times: 2
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
            for(let d of data){
                if(d.test.match(/[.\/\$\[\]#$]|^\s*$/)){
                    alert(`无法为该单词添加记录: ${d.test}`)
                    return
                }
            }
            
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
            
            let records = {}
            data.forEach(r => {
                r.success_counter = 0
                r.failed_counter = 0
                r.skiped_counter = 0
                r.test = r.test.trim()
                records[r.test] = r
            })
            console.log(records)
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
        }
    },
    created () {
    }
}
</script>