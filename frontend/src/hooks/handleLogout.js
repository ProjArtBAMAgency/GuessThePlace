import { store } from '@/store/store.js';

export default async function handleLogout() {
    try {
        const response = await fetch('/api/v1/authentification/logout', {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok) {
            console.error('Logout failed');
            return false;
        }

        console.log('Logout successful');
        store.commit('setConnectionStatus', false);
        store.commit('setCookieExpirationDate', null);
        store.commit('setPseudo', '');
        
        return true;

    } catch (error) {
        console.error('Error during logout:', error);
        return false;
    }
}