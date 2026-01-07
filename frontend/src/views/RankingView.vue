<script setup>
import { ref } from 'vue';

const isGlobalDisplayed = ref(true);
const isRedTeamDisplayed = ref(true);
const isBlueTeamDisplayed = ref(true);

const toggleGlobal = () => {
    isGlobalDisplayed.value = true;
    isRedTeamDisplayed.value = false;
    isBlueTeamDisplayed.value = false;
};

const toggleRedTeam = () => {
    isGlobalDisplayed.value = false;
    isRedTeamDisplayed.value = true;
    isBlueTeamDisplayed.value = false;
};

const toggleBlueTeam = () => {
    isGlobalDisplayed.value = false;
    isRedTeamDisplayed.value = false;
    isBlueTeamDisplayed.value = true;
};

</script>

<template>

<div class="flex flex-col max-w-2xl w-full items-center mb-2 rounded-md mt-6 p-6">
    <h1 class="text-xl font-bold text-purple mb-4">Leaderboard</h1>
    <p class="text-base text-center mb-4">
        Discover the top players in our community!
    </p>
    <div class="w-full mb-4">
        <div class="flex flex-row max-w-2xl w-full items-center mb-2 rounded-md">
            <div class="w-1/3 p-2 border border-r-white border-purple hover:bg-purple hover:text-white text-center rounded-l-md"
                :class="isGlobalDisplayed ? 'bg-purple text-white ' : 'bg-white text-purple'">
                <button @click="toggleGlobal">Global</button>

            </div>
            <div class="w-1/3 p-2 border-r-white border border-purple hover:bg-purple hover:text-white text-center"
                :class="isRedTeamDisplayed ? 'bg-purple text-white ' : 'bg-white text-purple'">
                <button @click="toggleRedTeam">Red team</button>
            </div>
            <div class="w-1/3 p-2 border border-purple hover:bg-purple hover:text-white text-center rounded-r-md"
                :class="isBlueTeamDisplayed ? 'bg-purple text-white ' : 'bg-white text-purple'">
                <button @click="toggleBlueTeam">Blue team</button>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped>

</style>
