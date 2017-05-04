<template lang="jade">
div
    button.btn.btn-link.btn-block.btn-lg(@click="back")
        i.glyphicon.glyphicon-chevron-left
        | Back  
    
</template>
<script>
export default {
    name: 'back-button',
    methods: {
        back () {
            window.history.back()
        }
    }
}
</script>