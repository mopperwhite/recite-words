<template lang="jade">
div
    div(v-for="item in items")
        router-link.btn.btn-block.btn-default(:to=" '/item/' + item.id ")
            | {{item.title}}
    router-link.btn.btn-block.btn-success(to="/additem")
        | 添加
</template>
<script>
import firebase from '../firebase'
import store from '../store'
export default {
    data() {
        return {
            items: []
        }
    },
    created(){
        const items_n = parseInt(localStorage['id_counter']) || 0
        // for(let i = 0; i < items_n; i++){
        //     this.items.push(JSON.parse(localStorage[`item/${i}`]))
        // }
        let ref = firebase.database().ref(`/users/${store.state.firebase_user.uid}/items`)
        ref.on('value', (snapshot) => {
            this.items = snapshot.val()
        })
    }
}
</script>
<style scoped>
.btn-y{
    font-size: 2em;
    margin: 0.5em;
}
</style>