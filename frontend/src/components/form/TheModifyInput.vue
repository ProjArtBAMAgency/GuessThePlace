<script setup>
import { ref, defineProps, defineEmits, watch, computed, onMounted } from 'vue';
import { Edit2, Check, X, Loader2 } from 'lucide-vue-next';
import TheTextInput from './TheTextInput.vue';

const props = defineProps({
    name: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    modelValue: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'text'
    },
    placeholder: {
        type: String,
        default: ''
    },
    readonly: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

const isEditing = ref(false);
const tempValue = ref(props.modelValue ?? '');
const isLoading = ref(false);
const isError = ref(false);
const errorMessage = ref('');
const isSuccess = ref(false);

const inputId = computed(() => `edit-${props.name}`);

watch(() => props.modelValue, (val) => {
  tempValue.value = val ?? '';
        });

const startEditing = () => {
    tempValue.value = props.modelValue ?? '';
    isEditing.value = true;
    isSuccess.value = false;
    isError.value = false;
};
watch(() => props.modelValue, (val) => {
  tempValue.value = val ?? '';
});

const cancelEdit = () => {
    isEditing.value = false;
    tempValue.value = props.modelValue ?? '';
    isSuccess.value = false;
    isError.value = false;
};

const saveChanges = async () => {
    isLoading.value = true;
    isError.value = false;
    isSuccess.value = false;

    try {
        const response = await fetch('/api/v1/profile/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ [props.name]: tempValue.value })
        });

        if (!response.ok) {
            console.log('Failed response:', response);
            let errorMsg = 'Failed to update';
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorData.error || response.statusText || errorMsg;
            } catch {
                errorMsg = response.statusText || errorMsg;
            }
            throw new Error(errorMsg);
        }

        await response.json();
        emit('update:modelValue', tempValue.value);
        isSuccess.value = true;
        isEditing.value = false;
    } catch (error) {
        isError.value = true;
        errorMessage.value = error.message || 'Network error';
        console.error('Error updating profile:', error);
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex justify-between items-center mb-2">
            <h2 class="font-semibold text-lg">{{label}}</h2>
            <button v-if="!isEditing" @click="startEditing"
                class="text-purple hover:text-purple-dark transition">
                <Edit2 class="w-5 h-5" />
            </button>
        </div>
        <div v-if="!isEditing">
            <p class="text-gray-700">{{ modelValue }}</p>
            <div v-if="isSuccess" class="text-green text-sm mt-2">
                Changes saved successfully! 
            </div>
        </div>
        <div v-else class="flex flex-col gap-2">
            <TheTextInput :id="inputId" :type="type" :label="label" v-model="tempValue" :placeholder="placeholder" />
            <div v-if="!isLoading" class="flex gap-2">
                <button @click="saveChanges"
                    class="flex items-center gap-1 bg-purple text-white px-3 py-1 rounded hover:bg-purple-dark transition">
                    <Check class="w-4 h-4" /> Save
                </button>
                <button @click="cancelEdit"
                    class="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition">
                    <X class="w-4 h-4" /> Cancel
                </button>
            </div>
            <div v-else class="flex items-center gap-2">
                <Loader2 class="w-5 h-5 animate-spin text-purple" />
                <span>Saving...</span>
            </div>
            <div v-if="isError" class="text-red text-sm mt-2">
                {{ errorMessage }}
            </div>

        </div>
    </div>

</template>

<style scoped></style>
