import firebase from './firebase'
import store from './store'
export default {
    myRef(path){
        return firebase.database().ref(`/users/${store.state.firebase_user.uid}/${path}`)
    },
    ref(path){
        return firebase.database().ref(path)
    }

}