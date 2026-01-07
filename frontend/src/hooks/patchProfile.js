import { ref } from 'vue';

const error = ref(null);
const user = ref(null);
const isLoading = ref(false);   

export const patchProfile = async (updatedData) => {
    try {
        isLoading.value = true;
        const response = await fetch('/api/v1/profile/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(updatedData),
        });             

        if (!response.ok) {
            throw new Error('Failed to update user profile');
        }

        const userData = await response.json();
        console.log('User profile updated successfully');
        isLoading.value = false;
        user.value = userData;
        error.value = null;
        return { user: user.value, error: error.value, loading: isLoading.value };

    } catch (error) {
        isLoading.value = false;
        console.error('Failed to update user profile:', error);
        error.value = 'Failed to update user profile';
        user.value = null;
        return { user: user.value, error: error.value, loading: isLoading.value };
    }
};