<template>
<div class="map-view">
        <h1>Map View</h1>
        <p>
            This is the Map view of the Guess The Place application.
        </p>

        <aside class="recent-container">
            <TheSlider />
            <TheRecentGuesses />
        </aside>
    </div>
</template>

<script setup>
import TheSlider from "@/components/TheSlider.vue";
import TheRecentGuesses from '@/components/TheRecentGuesses.vue'
</script>