<template lang="jade">
div
    h1.muted
        | 正在加载登录信息...
</template>
<script>
import store from '../store'
import bus from '../bus'
export default {
    created(){
        bus.$on('firebase_initialized', user => {
            if(user){
                this.$router.replace('/home')
            }else{
                this.$router.replace('/account')
            }
        })
    }
}
</script>