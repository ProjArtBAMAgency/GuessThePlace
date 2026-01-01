<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import TheTextInput from './TheTextInput.vue';
import { Loader2, TriangleAlert } from 'lucide-vue-next';
import handleLogout from '@/hooks/handleLogout';

const router = useRouter();
const editingPassword = ref(false);

const password = ref('');
const confirmPassword = ref('');
const isError = ref(false);
const errorMessage = ref('');
const isLoading = ref(false);

const startDeletion = () => {
    password.value = '';
    editingPassword.value = true;
    isError.value = false;
    errorMessage.value = '';
};

const deleteAccount = async () => {
    if (!password.value) {
        isError.value = true;
        errorMessage.value = 'Please enter your password to confirm deletion.';
        return;
    }

    if(password.value != confirmPassword.value) {
        isError.value = true;
        errorMessage.value = 'Password and confirmation do not match.';
        return;
    }

    isError.value = false;
    isLoading.value = true;

    try {
        const response = await fetch('/api/v1/profile/me', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                password: password.value,
            }),
        });

        if (!response.ok) {
            let errorMsg = 'Failed to delete account';
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorData.error || errorMsg;
            } catch {
                errorMsg = response.statusText || errorMsg;
            }
            throw new Error(errorMsg);
        }

        await handleLogout();
        router.push('/signin');

    } catch (error) {
        isError.value = true;
        errorMessage.value = error.message || 'Network error';
    } finally {
        isLoading.value = false;
    }

};

const cancelDeletion = () => {
    editingPassword.value = false;
    password.value = '';
    confirmPassword.value = '';
    isError.value = false
    isLoading.value = false;
};

</script>

<template>
    <div class="rounded-lg p-4 bg-red text-white flex flex-col items-center max-w-sm mx-auto mb-18">
        <div class="flex justify-between items-center">
            <button v-if="!editingPassword" @click="startDeletion" class=" font-semibold">
                Delete your account
            </button>
        </div>
        <div v-if="editingPassword" class="flex flex-col gap-2 items-center">
            <button @click="cancelDeletion" class="text-white underline">X Cancel</button>

            <h1 class="font-bold text-xl mt-4">Confirm Account Deletion</h1>
            <div class="flex flex-row gap-2 mb-4 items-center">
                <TriangleAlert class="w-5- h-5"/>
                <p>
                    Be careful, this action is irreversible.
                </p>
            </div>

            <TheTextInput id="current-password" label="Password" v-model="password" type="password" :isDark="true" />
            <TheTextInput id="confirm-password" label="Confirm Password" v-model="confirmPassword" type="password" :isDark="true" />

            <div class="border rounded-lg p-2 hover:bg-black/20 transition cursor-pointer bg-red font-semibold">
                <button @click="deleteAccount" :disabled="isLoading" class="w-full">
                    Confirm Deletion
                </button>
            </div>
            <div v-if="isLoading" class="flex items-center gap-2">
                <Loader2 class="w-5 h-5 animate-spin text-white" />
                <span>Saving...</span>
            </div>
            <div v-if="isError" class="bg-white text-red rounded-lg p-2 mt-2">
                {{ errorMessage }}
            </div>
        </div>
    </div>
</template>

<style scoped></style>
