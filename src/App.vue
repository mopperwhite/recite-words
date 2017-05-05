<template lang="jade">
div#body
  router-view(v-if="store.state.firebase_initialized")
  index(v-else)
  footer.footer
    back-button
    router-link.btn.btn-link.btn-block(to="/dashboard")
          i.fa.fa-cog
          | Dashboard
</template>

<script>
import store from './store'
import Index from './routes/Index.vue'
import bus from './bus'
import BackButton from './components/BackButton.vue'
export default {
  name: 'app',
  data () {
    return {
      store
    }
  },
  components: {
    Index,
    BackButton
  },
  methods:{
        switch(user){
            if(!user){
               this.$router.push('/account')   
            }
        }
    },
    created(){
        bus.$on('firebase_initialized', user => {
            this.switch(user)
        })
    }
}
</script>

<style>
#body {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 5em;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.footer{
  margin-top: 10em;
  height: 10em;
}

@media (min-width: 1000px){
    #body{
        position: absolute;
        left: 10%;
        right: 10%;
        width: 80%;
    }
}
</style>
