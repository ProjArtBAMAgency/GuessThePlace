import { store } from '@/store/store.js';
import { ref } from 'vue';

const error = ref(null);
const user = ref(null);
const isLoading = ref(false);   

export const getProfile = async () => {
    try {
        isLoading.value = true;
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

        const userData = await response.json();
        console.log('User profile fetched successfully');
        isLoading.value = false;
        user.value = userData;
        error.value = null;
        return { user: user.value, error: error.value, loading: isLoading.value };

    } catch (error) {
        isLoading.value = false;
        console.error('Failed to fetch user profile:', error);
        error.value = 'Failed to fetch user profile';
        user.value = null;
        return { user: user.value, error: error.value, loading: isLoading.value };
    }
};