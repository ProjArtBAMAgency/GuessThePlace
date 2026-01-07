<script setup>
import TheGuessElement from './TheGuessElement.vue';
import { ref, onMounted } from 'vue';
import { LoaderCircle } from 'lucide-vue-next';


const props = defineProps({

    // Si la liste des guesses est pour le profil utilisateur, on passe l'id de l'utilisateur
    isProfile: {
        type: Boolean,
        required: true
    },
    userId: {
        type: String,
        required: false,
        default: null
    },
    // Si la liste des guesses est pour un post spécifique, on passe l'id du post
    postId: {
        type: String,
        required: false,
        default: null
    }
});

const guesses = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const page = ref(1);
const limit = 10;
const totalPages = ref(0);


const loadMore = async () => {
    if (page.value >= totalPages.value || isLoading.value) return;
    page.value += 1;
    await fetchGuesses();
};

const fetchGuesses = async () => {
    let url = "";

    if (props.isProfile && props.userId) {
        url = `/api/v1/guesses/user/${props.userId}?page=${page.value}&limit=${limit}`;
    } else if (props.postId) {
        url = `/api/v1/guesses/posts/${props.postId}?page=${page.value}&limit=${limit}`;
    } else {
        return;
    }

    try {
        isLoading.value = true;
        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Failed to fetch more guesses");
        }

        const data = await response.json();
        isLoading.value = false;

        guesses.value = [...guesses.value, ...data.guesses];
        totalPages.value = data.totalPages;
        errorMessage.value = "";
    } catch (error) {
        errorMessage.value = "Error fetching more guesses.";
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    await fetchGuesses();
});

</script>

<template>
    <div class="w-full max-w-2xl flex flex-col items-center">
        <p v-if="isLoading" class="mt-4">
            <LoaderCircle class="inline-block w-6 h-6 animate-spin text-purple" /> Loading
        </p>
        <div v-else-if="errorMessage" class="text-red-500 my-4">{{ errorMessage }}</div>
        <div v-else-if="guesses.length === 0" class="text-gray-500 my-4">No guesses found.</div>
        <div v-else class="w-full mb-2">
            <TheGuessElement v-for="guess in guesses" :key="guess._id" :guess="guess" :score="guess.score"
                :authorPseudo="guess.post?.userId?.pseudo ?? null" :createdAt="guess.createdAt" class="mb-4" />
        </div>
        <div class="mb-20">
            <button v-if="page < totalPages" @click="loadMore" class="bg-purple rounded-lg p-2 pl-4 pr-4 text-white">Load More</button>
        </div>
    </div>

</template>

<style scoped></style>
