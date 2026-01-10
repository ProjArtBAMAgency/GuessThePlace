import { ref } from 'vue';

const error = ref(null);
const isLoading = ref(false);


export const getAvailablePosts = async (pageParam = 1, limitParam = 20) => {
    isLoading.value = true;
    error.value = null;

    try {
        const url = `/api/v1/profile/me/available-posts?page=${pageParam}&limit=${limitParam}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch available posts');
        }

        const postsData = await response.json();
        console.log('Available posts fetched successfully');
        isLoading.value = false;
        return { isLoading: false, posts: postsData, error: null };
        
    } catch (err) {
        console.error('Failed to fetch available posts:', err);
        error.value = 'Failed to fetch available posts';
        isLoading.value = false;
        return { isLoading: false, posts: null, error: error.value };
    }
};
