<script setup>
import { ref, onMounted } from 'vue'

let username = ref('');
let email = ref('');
let password = ref('');
let team_id = ref('');
let errorMessage = ref('');


const teams = ref([]);

onMounted(async () => {
  try {
    const res = await fetch('/api/v1/teams');
    const data = await res.json();
    teams.value = data;
    console.log(teams.value);
  } catch (err) {
    console.error('Erreur lors du chargement des équipes', err);
  }
});

</script>

<template>
    <h1 class="font-bold text-2xl mb-4 p-2">Sign Up</h1>
    <p class="mb-4 p-2">
        Sign up to join the Guess The Place application!
    </p>
    <form action="" class="p-2">
        <div class="mb-4">
            <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
            <p class="text-xs text-gray-500">Must be between 6 and 10 characters, and unique.</p>
            <input type="text" id="username" name="username" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" name="email" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" id="password" name="password" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div class="mb-4">
            <label for="team" class="block text-sm font-medium text-gray-700">Select Team</label>
            <p class="text-xs text-gray-500">Pick a team from the list below, be careful, you wont be able to change it later.</p>
            <select id="team" name="team" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                <option v-for="team in teams" :key="team._id" :value="team._id">{{ team.name }}</option>
            </select>
        </div>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Sign Up</button>
    </form>
</template>

<style scoped>

</style>