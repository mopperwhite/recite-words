<template lang="jade">
div
    back-button
    firebase
</template>
<script>
import Firebase from '../components/Firebase.vue'
import BackButton from '../components/BackButton.vue'
export default {
    components: {
        Firebase,
        BackButton
    }
}
</script>