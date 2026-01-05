<script setup>
import { Settings, LoaderCircle } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { store } from '@/store/store.js';
import TheProfilePostsPreview from '@/components/posts/TheProfilePostsPreview.vue';

const userId = store.state.userId;
const userPosts = ref([]);
const isLoading = ref(true);
const errorMessage = ref("");

onMounted(async () => {
    isLoading.value = true;
    if (!userId) {
        console.log('No userId found in store.');
        errorMessage.value = "User ID not found.";
        isLoading.value = false;
        return;
    } else {
        console.log('Fetching posts for userId:', userId);
        userPosts.value = await fetch(`/api/v1/posts/user`, { credentials: 'include' })
            .then(res => res.json()

            ).then(data => {
                isLoading.value = false;
                return data;
            })

            .catch(err => {
                console.error('Error fetching user posts:', err);
                errorMessage.value = "Failed to load user posts.";
                isLoading.value = false;
                return [];
            });
        console.log('User posts:', userPosts.value);
    }
});

</script>

<template>
    <div class="min-h-screen p-2 flex flex-col items-center">
        <div class="flex flex-col p-2 items-center">
            <div class="flex justify-end max-w-md w-full">
                <RouterLink to="/settings">
                    <Settings class="w-6 h-6 text-purple mb-4" />
                </RouterLink>
            </div>
            <h1 class="font-bold text-2xl mb-4">Your Profile</h1>
            <p class="">Hi {{ store.state.pseudo }} !</p>
            <p class="mb-4 text-center mt-2">
                Find all your personal information and settings here.
            </p>
        </div>
        <div class="flex flex-row max-w-2xl w-full items-center mb-2 border-t border-b border-l border-r rounded-md">
            <div class="w-1/2 border-r p-2 hover:bg-gray-dark text-center">
                <button>Your Posts</button>

            </div>
            <div class="w-1/2 p-2 hover:bg-gray-dark text-center">
                <button>Your Guesses</button>
            </div>
        </div>

        <div class=" max-w-2xl ">
            <TheProfilePostsPreview />
        </div>
        <div>
            <p v-if="isLoading" class="mt-4">
                <LoaderCircle class="inline-block w-6 h-6 animate-spin" /> Loading</p>
            <p v-if="errorMessage" class="mt-4 text-red-500">{{ errorMessage }}</p>
        </div>
    </div>
</template>