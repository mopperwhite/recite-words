import Vue from 'vue'
import firebase from './firebase'
import store from './store'
const db = firebase.database()
export default function(itemid, callback){
    let uid, user
    let it = setInterval(() => {
        user = store.state.firebase_user
        if(user){
            uid = user.uid
            callback(
                new Vue({
                    firebase:{
                    records: db.ref(`/users/${uid}/items/${itemid}`)
                }
            }))
            clearInterval(it)
        }
    }, 100)
}