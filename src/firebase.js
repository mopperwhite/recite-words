import Firebase from 'firebase'
import firebase_auth from '../firebase.json'
import store from './store'

const firebase = Firebase.initializeApp(firebase_auth)

Firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      store.commit('set_firebase_user', {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
      })
    }else{
        store.commit('set_firebase_user', null)
    }
})

export default firebase