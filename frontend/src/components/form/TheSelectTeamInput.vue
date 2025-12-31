<script setup>
import { ref, onMounted } from 'vue';
import TheInfoButton from '@/components/buttons/TheInfoButton.vue';

const teams = ref([]);

const props = defineProps({
    selectedTeamError: {
        type: Boolean,
        required: false,
        default: false
    },
    modelValue: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['update:modelValue'])

function updateValue(event) {
    emit('update:modelValue', event.target.value)
}

onMounted(async () => {
    try {
        const res = await fetch('/api/v1/teams');

        if (!res.ok) {
            throw new Error('Failed to fetch teams');
        }
        const data = await res.json();
        teams.value = data;
        console.log(teams.value);

    } catch (err) {
        console.error('Erreur lors du chargement des équipes', err);
    }
});


</script>

<template>

    <div class="w-full flex flex-col gap-2 mb-6">
        <div class="flex flex-row gap-4 items-center">
            <div>
                <label for="team" class="block text-sm text-purple font-medium ">Select Team <p
                        class="inline-block text-red">*</p></label>
            </div>
            <div>
                <TheInfoButton
                    label="Pick a team to join the Guess The Place challenge. Team up, guess locations and score points ! Choose wisely—you can’t change teams later." />
            </div>
        </div>
        <select id="team" name="team" class="mt-1 block w-full border border-purple rounded-md shadow-sm p-2"
            :value="props.modelValue" @change="updateValue">
            <option value="" disabled>Select a team</option>
            <option v-for="team in teams" :key="team._id" :value="team._id">{{ team.name }}</option>
        </select>
        <p v-if="props.selectedTeamError" class="text-xs text-red mt-1">Please select a team.</p>
    </div>
</template>

<style scoped></style>