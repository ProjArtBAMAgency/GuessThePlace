<script setup>
import { ref } from 'vue'
import { store } from '@/store/store.js'
import TheButton from './TheButton.vue';

const feedback = ref('');
const isSuccess = ref(false);

async function handleLogout() {
    try {
        const response = await fetch('/api/v1/authentification/logout', {
            method: 'POST',
            credentials: 'include',
        });

        if (!response) {
            console.error('Logout failed');
            return;
        }

        console.log('Logout successful');
        feedback.value = 'Logout successful!';
        isSuccess.value = true;
        store.commit('setConnectionStatus', false);
        store.commit('setCookieExpirationDate', null);
        store.commit('setPseudo', '');

    } catch (error) {
        console.error('Error during logout:', error);
        feedback.value = 'Error during logout.';
        isSuccess.value = false;
    }
}
</script>

<template>
    <form @submit.prevent="handleLogout">
        <TheButton type="submit" label="Logout" />
    </form>
    <p :class=" isSuccess ? 'text-green' : 'text-red'">{{ feedback }}</p>

</template>

<style scoped>

</style>
