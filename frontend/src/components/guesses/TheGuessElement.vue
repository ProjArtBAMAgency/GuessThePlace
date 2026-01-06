<script setup>
import { ref, onMounted } from 'vue';
import { format } from 'date-fns';


const guessDate = ref(null);

const props = defineProps({
    score: {
        type: Number,
        required: true
    },
    authorPseudo: {
        type: String,
        required: false,
        default: null
    },
    createdAt: {
        type: String,
        required: false,
        default: null
    }
});

onMounted(() => {
    if (props.createdAt) {
        guessDate.value = format(new Date(props.createdAt), 'MM/dd/yyyy');
    }
});

</script>

<template>
    <div class="flex flex-row justify-between items-center border-b border-gray-light py-2 px-2">
        <p v-if="authorPseudo"class="font-light text-dark-purple text-base">Post by <span class="text-purple">{{ authorPseudo}}</span></p>
        <p v-else class="font-light text-dark-purple text-base">Post by <span class="text-purple">Unknown</span></p>
        <p v-if="guessDate">{{ guessDate }}</p>
        <p class="text-sm">Score: <span class="font-bold text-purple text-base">{{ score }}</span></p>
    </div>
</template>

<style scoped></style>