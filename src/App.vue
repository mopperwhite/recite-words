<template lang="jade">
div#body
  router-view
  footer.footer
    router-link.btn.btn-link.btn-block(to="/dashboard")
          i.fa.fa-cog
          | Dashboard
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
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
