<script setup>
import { ref, onMounted } from 'vue';
import { store } from '@/store/store.js';

const userId = store.state.userId;
const statistics = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");

const postsCount = ref(0);
const guessesCount = ref(0);
const totalScore = ref(0);


</script>

<template>

</template>

<style scoped>

</style>