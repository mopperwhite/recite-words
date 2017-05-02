<template lang="jade">
div
    div(v-for="item in items")
        router-link.btn.btn-block.btn-default(:to=" '/item/' + item.id ")
            | {{item.title}}
    router-link.btn.btn-block.btn-success(to="/additem")
        | 添加
</template>
<script>
export default {
    data() {
        return {
            items: []
        }
    },
    created(){
        const items_n = parseInt(localStorage['id_counter']) || 0
        for(let i = 0; i < items_n; i++){
            this.items.push(JSON.parse(localStorage[`item/${i}`]))
        }    
    }
}
</script>
<style scoped>
.btn{
    font-size: 2em;
    margin: 0.5em;
}
</style>