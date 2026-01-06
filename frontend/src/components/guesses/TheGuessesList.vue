<script setup>
import TheGuessElement from './TheGuessElement.vue';
import { ref, onMounted } from 'vue';
import { LoaderCircle } from 'lucide-vue-next';

const guesses = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const page = ref(1);
const limit = 50;
const totalPages = ref(0);



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

onMounted(async () => {
    if (props.isProfile && props.userId) {
        // Fetch des guesses pour le profil utilisateur
        try {
            isLoading.value = true;
            const response = await fetch(`/api/v1/guesses/user/${props.userId}?page=${page.value}&limit=${limit}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user guesses");
            }

            const data = await response.json();

            isLoading.value = false;
            guesses.value = data.guesses;
            totalPages.value = data.totalPages;
            errorMessage.value = "";
            console.log("Fetched user guesses:", guesses.value[0]);
        } catch (error) {
            errorMessage.value = "Error fetching guesses.";
            isLoading.value = false;
            totalPages.value = 0;
        }
    } else if (props.postId) {
        // Fetch des guesses pour le post spécifique
        try {
            isLoading.value = true;

            const response = await fetch(`/api/v1/guesses/posts/${props.postId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to fetch post guesses");
            }

            const data = await response.json();
            isLoading.value = false;
            guesses.value = data.guesses;
            totalPages.value = data.totalPages;
            errorMessage.value = "";
        } catch (error) {
            isLoading.value = false;
            totalPages.value = 0;
            errorMessage.value = "Error fetching guesses.";
            console.error("Error fetching post guesses:", error);
        }
    }
});

</script>

<template>
    <div class="w-full max-w-2xl flex flex-col items-center">
        <p v-if="isLoading" class="mt-4">
            <LoaderCircle class="inline-block w-6 h-6 animate-spin text-purple" /> Loading
        </p>
        <div v-else-if="errorMessage" class="text-red-500 my-4">{{ errorMessage }}</div>
        <div v-else-if="guesses.length === 0" class="text-gray-500 my-4">No guesses found.</div>
        <div v-else class="w-full">
            <TheGuessElement 
                v-for="guess in guesses" 
                :key="guess._id" 
                :guess="guess" 
                :score="guess.score"
                :authorPseudo="guess.post?.userId?.pseudo ?? null"
                :createdAt="guess.createdAt" 
                class="mb-4" 
            />
        </div>
    </div>

</template>

<style scoped></style>
