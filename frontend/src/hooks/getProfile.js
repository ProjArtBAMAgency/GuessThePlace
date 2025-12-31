import { store } from '@/store/store.js';

export const getProfile = async () => {
    try {
        const response = await fetch('/api/v1/profile/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })

        if (!response.ok) {
            throw new Error('Failed to fetch user profile');
        }
        const user = await response.json();
        console.log('User profile fetched successfully');
        console.log(user);
        
        return user;

    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        return null;
    }
};