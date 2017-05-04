import Vue from 'vue'
import firebase from './firebase'
import store from './store'
const db = firebase.database()
export default function(itemid){
    let uid = store.firebase_user.uid
    return new Vue({
        firebase:{
            records: db.ref(`/users/${uid}/items/${itemid}`)
        }
    })
}