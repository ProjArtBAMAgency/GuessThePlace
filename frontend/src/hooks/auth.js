import { store } from "@/store/store";

// Créer un hook personnalisé pour l'authentification 
// afin de vérifier le statut de connexion et la validité du cookie
// il sera utilisé dans le router pour rediriger les utilisateurs non authentifiés.

export function useAuth() {

    const isLoggedIn = () => {
        return store.state.isConnected;
    };

    const getCookieExpirationDate = () => {

        if(store.state.cookieExpirationDate < Date.now()) {
            store.commit('setConnectionStatus', false)
            store.commit('setCookieExpirationDate', null)
            return false;
        }
    }
    return { isLoggedIn, getCookieExpirationDate };
}