<script setup>
import { Route, Undo2 } from 'lucide-vue-next';
import { onMounted } from 'vue';
import { getProfile } from '@/hooks/getProfile';
import { RouterLink } from 'vue-router';
import TheLogoutButton from '@/components/buttons/TheLogoutButton.vue';

onMounted(async () => {
    const profileData = await getProfile();
    console.log('Profile data:', profileData);
});

</script>

<template>
    <div class="container p-2">
        <div class="flex flex-col p-2">
            <div class="flex justify-start">
                <RouterLink to="/profile">
                    <Undo2 class="w-6 h-6 text-purple mb-4" />
                </RouterLink>
            </div>
            <h1 class="font-bold text-2xl mb-4">Your Personal Settings</h1>
            <p class="mb-4">
                Find all your personal information and settings here.
            </p>
        </div>
            <TheLogoutButton />
    </div>

</template>

<style scoped>

</style>