<template lang="jade">
div
    div.form-group
        label
            | 标题
        input.form-control(v-model="title")
    div.form-group
        label
            | 数据
        textarea.form-control(v-model="yaml_data", row=15)
    button.btn.btn-block.btn-primary(@click="submit")
        | 提交
</template>
<script>
// import YAML from 'yaml'
export default {
    data () {
        return {
            title: '',
            yaml_data: '',
        }
    },
    methods: {
        submit(){
            let new_id = parseInt(localStorage['id_counter'] || 0)
            localStorage[`item/${new_id}`] = JSON.stringify({
                id: new_id,
                title: this.title,
                data: JSON.parse(this.yaml_data)
            })
            localStorage['id_counter'] = new_id + 1
            this.$router.replace('/')
        }
    },
    created () {
    }
}
</script>