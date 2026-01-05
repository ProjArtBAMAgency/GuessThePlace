import { createStore } from 'vuex'

// Création du store dans lequel on va gérer l'état global de l'app, particulièrement
// l'état de connection de l'utilisateur. 

// on stocke aussi la date d'expiration du cookie pour savoir si l'utilisateur est toujours connecté.

// Charger l'état depuis localStorage au démarrage
const savedState = localStorage.getItem('authState')
const initialState = savedState ? JSON.parse(savedState) : {
    isConnected: false,
    cookieExpirationDate: null,
    pseudo: "",
}

export const store = createStore({
    state() {
        return initialState
    },
    mutations: {
        setConnectionStatus(state, status) {
            state.isConnected = status
            // Persister dans localStorage à chaque changement
            localStorage.setItem('authState', JSON.stringify(state))
        },
        setCookieExpirationDate(state, date) {
            state.cookieExpirationDate = date
            // Persister dans localStorage à chaque changement
            localStorage.setItem('authState', JSON.stringify(state))
        },
        setPseudo(state, pseudo) {
            state.pseudo = pseudo
            // Persister dans localStorage à chaque changement
            localStorage.setItem('authState', JSON.stringify(state))
        }
    }
})
