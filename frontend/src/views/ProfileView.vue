<script setup>
import { Settings } from 'lucide-vue-next';
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { store } from '@/store/store.js';

</script>

<template>
    <div class="min-h-screen p-2">
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

    </div>
</template>