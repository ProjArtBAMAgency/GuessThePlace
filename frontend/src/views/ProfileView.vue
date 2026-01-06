<script setup>
import { Settings, LoaderCircle } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { store } from '@/store/store.js';
import TheProfilePostsPreview from '@/components/posts/TheProfilePostsPreview.vue';
import TheUserStatistics from '@/components/statistics/TheUserStatistics.vue';
import TheGuessesList from '@/components/guesses/TheGuessesList.vue';

const userId = store.state.userId;
const userPosts = ref([]);
const isLoading = ref(true);
const errorMessage = ref("");
const isPostsDisplayed = ref(true);

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
            <h1 class="text-2xl mb-4">{{ store.state.pseudo }} Profile</h1>
            <p class="text-lg font-bold "></p>
            <TheUserStatistics class="mt-4" />
        </div>
        <div class="flex flex-row max-w-2xl w-full items-center mb-2 rounded-md">
            <div class="w-1/2 p-2 border border-r-white border-purple hover:bg-purple hover:text-white text-center rounded-l-md"
                :class="isPostsDisplayed ? 'bg-purple text-white ' : 'bg-white text-purple'">
                <button @click="isPostsDisplayed = true">Your Posts</button>

            </div>
            <div class="w-1/2 p-2 border border-purple hover:bg-purple hover:text-white text-center rounded-r-md"
                :class="!isPostsDisplayed ? 'bg-purple text-white ' : 'bg-white text-purple'">
                <button @click="isPostsDisplayed = false">Your Guesses</button>
            </div>
        </div>

        <div v-if="isPostsDisplayed" class=" max-w-2xl ">
            <TheProfilePostsPreview />
        </div>
        <div v-else class="w-full max-w-2xl flex flex-col items-center">
            <TheGuessesList :isProfile="true" :userId="userId" />
        </div>
    </div>
</template>