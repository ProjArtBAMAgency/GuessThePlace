<template>
    <div class="map-view">
        <h1>Map View</h1>
        <p>
            This is the Map view of the Guess The Place application.
        </p>

        <aside class="recent-container">
            <TheRecentGuesses />
        </aside>
    </div>
</template>

<script setup>
import TheRecentGuesses from '@/components/TheRecentGuesses.vue'
</script>

<style scoped>
.recent-container {
    margin-top: 1rem;
}
</style>