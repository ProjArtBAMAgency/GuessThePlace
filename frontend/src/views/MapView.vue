<template>
    <div class="flex flex-col px-4 pt-4 pb-24">
        <h1 class="text-xl font-extrabold tracking-tight mb-2 text-purple mt-7 text-center">MAP</h1>
        <p class="text-gray-600 text-center mb-6">
            This is the Map view of the Guess The Place application.
        </p>

        <div class="flex flex-col gap-6 w-full max-w-md mx-auto">
            <TheSlider />
            <TheRecentGuesses />
        </div>
    </div>
</template>

<script setup>
import TheSlider from "@/components/TheSlider.vue";
import TheRecentGuesses from '@/components/TheRecentGuesses.vue'
</script>