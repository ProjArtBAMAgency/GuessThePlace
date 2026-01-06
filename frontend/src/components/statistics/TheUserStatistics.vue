<script setup>
import { ref, onMounted } from 'vue';
import { store } from '@/store/store.js';
import { LoaderCircle } from 'lucide-vue-next';

const userId = store.state.userId;
const statistics = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");

const totalGuesses = ref(0);
const totalPosts = ref(0);
const totalScore = ref(0);
const team = ref("");

onMounted(async () => {
    if (!userId) {
        console.log('No userId found in store.');
        errorMessage.value = "User ID not found.";
        return;
    } else {
        try {
            isLoading.value = true;
            const response = await fetch(`/api/v1/profile/me/statistics`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user statistics (status ${response.status})`);
            }

            const data = await response.json();
            statistics.value = data;
            totalPosts.value = data.totalPosts;
            totalGuesses.value = data.totalGuesses;
            totalScore.value = data.totalScore;
            team.value = data.team;

            console.log('Fetched user statistics:', statistics.value);
            errorMessage.value = "";
        } catch (error) {
            console.error('Error fetching user statistics:', error);
            errorMessage.value = "Failed to load user statistics.";
        } finally {
            isLoading.value = false;
        }
    }
});

</script>

<template>
    <div v-if="!isLoading && !errorMessage" class="w-full max-w-2xl flex flex-col items-center">
        <p class="mb-2" :class="team === 'Red Team' ? 'text-red' : 'text-blue-light'">{{ team }}</p>
        <div class="flex flex-row gap-8 border-t border-gray-light pt-2 mb-4 w-full">
            <div class="w-1/3 flex flex-col items-center">
                <p class="font-light">Posts</p>
                <span class="font-bold text-purple">{{ totalPosts }}</span>
            </div>

            <div class="w-1/3 flex flex-col items-center">
                <p class="font-light">Guesses</p>
                <span class="font-bold text-purple">{{ totalGuesses }}</span>
            </div>

            <div class="w-1/3 flex flex-col items-center">
                <p class="font-light">Score</p>
                <span class="font-bold text-purple">{{ totalScore }}</span>
            </div>
        </div>

    </div>
    <div class="w-full max-w-2xl flex flex-col items-center gap-2">
        <p v-if="isLoading" class="mt-4">
            <LoaderCircle class="inline-block w-6 h-6 animate-spin text-purple" /> Loading
        </p>
        <div v-else-if="errorMessage" class="text-red-500 my-4">{{ errorMessage }}</div>
    </div>
</template>

<style scoped></style>