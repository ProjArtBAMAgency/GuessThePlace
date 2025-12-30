import { createStore } from 'vuex'

// Création du store dans lequel on va gérer l'état global de l'app, particulièrement
// l'état de connection de l'utilisateur. 

// on stocke aussi la date d'expiration du cookie pour savoir si l'utilisateur est toujours connecté.

export const store = createStore({
    state() {
        return {
            isConnected: false,
            cookieExpirationDate: null,
        }
    },
    mutations: {
        setConnectionStatus(state, status) {
            state.isConnected = status
        },
        setCookieExpirationDate(state, date) {
            state.cookieExpirationDate = date
        }
    }
})
