<script setup>
import { Settings, LoaderCircle } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { store } from '@/store/store.js';
import TheProfilePostsPreview from '@/components/posts/TheProfilePostsPreview.vue';
import TheUserStatistics from '@/components/statistics/TheUserStatistics.vue';
import TheGuessesList from '@/components/guesses/TheGuessesList.vue';

const userId = store.state.userId;
const isPostsDisplayed = ref(true);


</script>

<template>
    <div class="min-h-screen p-2 flex flex-col items-center">
        <div class="flex flex-col max-w-2xl w-full items-center mb-2 rounded-md mt-6">
            <div class="flex flex-col p-2 items-center">
                <div class="absolute right-2 pr-6 md:relative md:pr-0 md:top-0 md:right-0">
                    <RouterLink to="/settings">
                        <Settings class="w-6 h-6 text-purple mb-4" />
                    </RouterLink>
                </div>
                <h1 class="text-2xl mb-4 justify-left">Hi {{ store.state.pseudo }} !</h1>
            </div>
            <div v-if="userId" class="max-w-2xl">
                <TheUserStatistics />
            </div>
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

        <div v-if="isPostsDisplayed" class="max-w-2xl">
            <TheProfilePostsPreview />
        </div>
        <div v-else class="w-full max-w-2xl flex flex-col items-center">
            <TheGuessesList :isProfile="true" :userId="userId" />
        </div>
    </div>
</template>