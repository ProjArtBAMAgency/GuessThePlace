<script setup>

const props = defineProps({
    ranking: {
        type: Number,
        required: true
    },
    pseudo: {
        type: String,
        required: true
    },
    totalScore: {
        type: Number,
        required: true
    },
    teamName: {
        type: String,
        required: false
    }
});

</script>

<template>
    <div class="w-full flex flex-row gap-3 m-2 rounded-md p-2 shadow-md" :class="teamName === 'Red Team' ? 'bg-red-light' : 'bg-light-blue'">
        <div class="w-1/2">
            <p class="text-base">#{{ ranking }} <span class="font-bold">{{ pseudo }}</span></p>
        </div>
        <div class="w-1/2">
            <p class="text-sm">Score: <span class="font-bold text-base">{{ totalScore.toFixed(0) }}</span></p>
        </div>
    </div>
</template>

<style scoped></style>