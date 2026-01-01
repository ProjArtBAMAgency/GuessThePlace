<script setup>
import { ref } from 'vue';
import TheTextInput from './TheTextInput.vue';
import { Check, Edit2, X, Loader2 } from 'lucide-vue-next';
const editingPassword = ref(false);

const tempPassword = ref('');
const tempConfirmPassword = ref('');
const isError = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);
const isSuccess = ref(false);
const tempCurrentPassword = ref('');

const startEditPassword = () => {
    tempPassword.value = '';
    tempConfirmPassword.value = '';
    editingPassword.value = true;
    isError.value = false;
    errorMessage.value = '';
    successMessage.value = '';
    isSuccess.value = false;
};

const savePassword = async () => {
    isError.value = false;
    isSuccess.value = false;
    isLoading.value = true;
    if (tempPassword.value !== tempConfirmPassword.value) {
        isError.value = true;
        errorMessage.value = 'New password and confirmation do not match.';
        isLoading.value = false;
        return;
    }

    try {
        const response = await fetch('/api/v1/profile/me/change-password', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                currentPassword: tempCurrentPassword.value,
                newPassword: tempPassword.value,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update password');
        }
        isSuccess.value = true;
        isLoading.value = false;
        successMessage.value = 'Password updated successfully!';


    } catch (error) {
        isError.value = true;
        isLoading.value = false;
        errorMessage.value = error.message || 'Network error';
        return;
    }

    editingPassword.value = false;
    tempPassword.value = '';
    tempConfirmPassword.value = '';
};


const cancelEditPassword = () => {
    editingPassword.value = false;
    tempPassword.value = '';
    tempConfirmPassword.value = '';
    isError.value = false;
    errorMessage.value = '';
    isLoading.value = false;
};

</script>

<template>
<div class="bg-white border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="font-semibold text-lg">Password</h2>
                    <button v-if="!editingPassword" @click="startEditPassword" 
                        class="text-purple hover:text-purple-dark transition">
                        <Edit2 class="w-5 h-5" />
                    </button>
                </div>
                <div v-if="!editingPassword">
                    <p class="text-gray">••••••••</p>
                    <div v-if="isSuccess" class="text-green">{{ successMessage }}</div>
                </div>
                <div v-else class="flex flex-col gap-2">
                    <TheTextInput id="current-password" label="Current Password" v-model="tempCurrentPassword" type="password" />
                    <TheTextInput id="edit-password" label="New Password" v-model="tempPassword" type="password" />
                    <TheTextInput id="edit-confirm-password" label="Confirm Password" v-model="tempConfirmPassword" type="password" />
                    <div class="flex gap-2">
                        <button @click="savePassword" 
                            class="flex items-center gap-1 bg-purple text-white px-3 py-1 rounded hover:bg-purple-dark transition">
                            <Check class="w-4 h-4" /> Save
                        </button>
                        <button @click="cancelEditPassword" 
                            class="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition">
                            <X class="w-4 h-4" /> Cancel
                        </button>
                    </div>
                    <div v-if="isLoading" class="flex items-center gap-2">
                        <Loader2 class="w-5 h-5 animate-spin text-purple" />
                        <span>Saving...</span>
                    </div>
                    <div v-if="isError" class="text-red">
                        {{ errorMessage }}  
                    </div>
                </div>
            </div>
</template>

<style scoped>

</style>
