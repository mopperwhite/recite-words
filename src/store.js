import Vue from 'vue'
import Vuex from 'vuex'
import firebase from './firebase'
Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        firebase_user: null,
        voice: null,
        voices: {},
        voice_name: localStorage['config:voice'],
        voice_list: [],
        speech_rate: parseFloat(localStorage['config:speech_rate'] || 1.0)
    },
    mutations: {
        initVoices(state){
            let intId = setInterval( () => {
                let vs = {}, vns = []
                for(let voice of speechSynthesis.getVoices()){
                    if(voice.lang.match(/^en-/)) {
                        let name = `${voice.name}(${voice.lang})`
                        vns.push(name)
                        vs[name] = voice
                    }
                }
                if(vns.length){
                    state.voice = vs[
                        state.voice_name = 
                            localStorage['config:voice'] || vns[0]]
                    state.voices = vs
                    state.voice_list = vns
                    clearInterval(intId)
                }
            }, 10)
        },
        set_voice(state, voice_name){
            state.voice_name = 
            localStorage['config:voice'] = voice_name
            state.voice = state.voices[voice_name]
        },
        set_speech_rate(state, rate){
            state.speech_rate = 
            localStorage['config:speech_rate'] = rate
        },
        set_firebase_user(state, user){
            state.firebase_user = user
        }
    },
    actions: {
        firebase_login({commit, dispatch}, {email, password}){
            firebase.auth()
                .signInWithEmailAndPassword(email, password)
                .catch(error => {
                let errorCode = error.code
                let errorMessage = error.message
                let email = error.email
                let credential = error.credential
                alert(`Error: ${errorMessage}`)
            })
        },
        firebase_register({commit, dispatch}, {email, password}){
            firebase.auth()
                .createUserWithEmailAndPassword(email, password)
                .catch(error => {
                    let errorCode = error.code
                    let errorMessage = error.message
                    let email = error.email
                    let credential = error.credential
                    alert(`Error: ${errorMessage}`)
                })
        },
        firebase_logout({commit}){
            firebase.auth().signOut()
                .catch(error => {
                alert(`Error: ${error.errorMessage}`)
            })
        }
    }
})