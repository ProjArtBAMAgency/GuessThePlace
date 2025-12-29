<script setup>
import { ref } from 'vue'

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

    } catch (error) {
        console.error('Error during logout:', error);
        feedback.value = 'Error during logout.';
        isSuccess.value = false;
    }
}
</script>

<template>
    <form @submit.prevent="handleLogout">
        <button  class="text-white bg-purple px-4 py-2 rounded-md border hover:bg-white hover:text-purple">Logout</button>
    </form>
    <p :class=" isSuccess ? 'text-green' : 'text-red'">{{ feedback }}</p>

</template>

<style scoped>

</style>
