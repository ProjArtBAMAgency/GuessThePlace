<script setup>
import { ref, onMounted } from 'vue';
import { getRankings, getTeams } from '@/components/composables/api/getRankings';
import TheLeaderbordElement from '@/components/ranking/TheLeaderbordElement.vue';

const rankings = ref([]);
const teams = ref([]);
const isLoading = ref(true);
const error = ref(null);

const limit = 10;
const page = ref(1);
const totalPages = ref(1);

const isGlobalDisplayed = ref(true);
const isRedTeamDisplayed = ref(false);
const isBlueTeamDisplayed = ref(false);

const loadRankings = async () => {
    await fetchRankings();
};

const fetchRankings = async (teamId = null) => {
    isLoading.value = true;
    const response = await getRankings(teamId, page.value, limit);

    if (response.data.value) {
        const newData = response.data.value.data || [];

        // Si c'est la première page, remplacer. Sinon, ajouter aux résultats existants
        if (page.value === 1) {
            rankings.value = newData;
        } else {
            rankings.value.push(...newData);
        }

        totalPages.value = response.data.value.pagination.totalPages || 1;
    } else {
        if (page.value === 1) {
            rankings.value = [];
        }
        totalPages.value = 1;
    }

    error.value = response.error.value;
    isLoading.value = response.isLoading.value;
};

onMounted(async () => {
    const teamsResponse = await getTeams();
    teams.value = teamsResponse.data.value || [];
    console.log('Teams loaded:', teams.value);
    await fetchRankings();
});

const toggleGlobal = async () => {
    isGlobalDisplayed.value = true;
    isRedTeamDisplayed.value = false;
    isBlueTeamDisplayed.value = false;

    page.value = 1;

    await fetchRankings();
    console.log('global rankings:', rankings.value);
};

const toggleRedTeam = async () => {
    isGlobalDisplayed.value = false;
    isRedTeamDisplayed.value = true;
    isBlueTeamDisplayed.value = false;

    page.value = 1;
    const redTeam = teams.value.find(team => team.name === 'Red Team');

    if (redTeam) {
        await fetchRankings(redTeam._id);
    } else {
        console.error('Red Team not found!');
    }
};

const toggleBlueTeam = async () => {
    isGlobalDisplayed.value = false;
    isRedTeamDisplayed.value = false;
    isBlueTeamDisplayed.value = true;

    page.value = 1;


    const blueTeam = teams.value.find(team => team.name === 'Blue Team');

    if (blueTeam) {
        await fetchRankings(blueTeam._id);
        console.log('blue team rankgings:', rankings.value);
    } else {
        console.error('Blue Team not found!');
    }
};

</script>

<template>
    <div class="min-h-screen p-2 flex flex-col items-center">
        <div class="flex flex-col max-w-2xl w-full items-center mb-2 rounded-md mt-6 p-6">
            <h1 class="text-xl font-bold text-purple mb-4">Ranking</h1>
            <p class="text-base text-center mb-4">
                Discover the top players in our community!
            </p>
            <div class="w-full mb-4">
                <div class="flex flex-row max-w-2xl w-full items-center rounded-md">
                    <div class="w-1/3 border border-r-white border-purple hover:bg-purple hover:text-white text-center rounded-l-md"
                        :class="isGlobalDisplayed ? 'bg-purple text-white ' : 'bg-white text-purple'">
                        <button @click="toggleGlobal" class="w-full h-full block cursor-pointer p-2">Global</button>

                    </div>
                    <div class="w-1/3 border border-r-white border-purple hover:bg-purple hover:text-white text-center"
                        :class="isRedTeamDisplayed ? 'bg-purple text-white ' : 'bg-white text-purple'">
                        <button @click="toggleRedTeam" class="w-full h-full block cursor-pointer p-2">Red team</button>
                    </div>
                    <div class="w-1/3 border border-purple hover:bg-purple hover:text-white text-center rounded-r-md"
                        :class="isBlueTeamDisplayed ? 'bg-purple text-white ' : 'bg-white text-purple'">
                        <button @click="toggleBlueTeam" class="w-full h-full block cursor-pointer p-2">Blue team</button>
                    </div>
                </div>
            </div>

            <div v-if="isLoading" class="text-purple">Loading...</div>
            <div v-else-if="error" class="text-red">{{ error }}</div>
            <div v-else-if="rankings.length === 0" class="text-gray">No rankings available yet.</div>
            <div v-else class="w-full">
                <TheLeaderbordElement v-for="ranking in rankings" :key="ranking.userId" :ranking="ranking.ranking"
                    :pseudo="ranking.pseudo" :totalScore="ranking.totalScore" :teamName="ranking.team" />
            </div>
            <div>
                <button v-if="isLoading || page < totalPages"
                    class="mt-4 px-4 py-2 bg-purple text-white rounded disabled:opacity-50"
                    @click="page++; loadRankings()">
                    {{ isLoading ? 'Loading…' : 'Load more' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
