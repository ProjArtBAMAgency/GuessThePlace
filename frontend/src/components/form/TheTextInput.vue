<script setup>
const props = defineProps({
    id: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'text'
    },
    modelValue: {
        type: String,
        required: true
    },
    legend: {
        type: String,
        default: ''
    },
    isError: {
        type: Boolean,
        default: false
    },
    isRequired: {
        type: Boolean,
        default: false
    }

})

const emit = defineEmits(['update:modelValue'])

function updateValue(event) {
    emit('update:modelValue', event.target.value)
}


</script>

<template>
    <div class="mb-2 w-full">
        <div>
            <label :for="id" class="text-purple">{{ label }}</label>
            <p v-if="isRequired" class="inline-block text-red ml-1">*</p>
        </div>
        <input :type="type" :id="id" :name="id" :value="modelValue" @input="updateValue" :required="isRequired"
            :class="['mt-1 block w-full border rounded-md shadow-sm p-2', isError ? 'border-red' : 'border-purple']" />
        <p v-if="legend" class="text-xs mt-2" :class="isError ? 'text-red' : 'text-gray-dark'">{{ legend }}</p>
    </div>
</template>

<style scoped></style>