<script setup>
import { ref, onMounted } from 'vue';
import { getProfile } from '@/hooks/getProfile';
import TheTextInput from '@/components/form/TheTextInput.vue';
import { patchProfile } from '@/hooks/patchProfile';
import { Undo2, Edit2, Check, X } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';
import TheModifyInput from '@/components/form/TheModifyInput.vue';
import { store } from '@/store/store.js';

const profile = ref({});
const error = ref(null);
const loading = ref(true);

const editingPassword = ref(false);

const tempPassword = ref('');
const tempConfirmPassword = ref('');

onMounted(async () => {
    const profileData = await getProfile();
    profile.value = profileData;
    error.value = profileData.error;
    loading.value = profileData.loading;
    
    console.log('Profile data:', profileData);
});


const startEditPassword = () => {
    tempPassword.value = '';
    tempConfirmPassword.value = '';
    editingPassword.value = true;
};



const savePassword = async () => {
    if (tempPassword.value !== tempConfirmPassword.value) {
        alert('Passwords do not match!');
        return;
    }
    const result = await patchProfile({ password: tempPassword.value });
    if (result.error) {
        alert('Failed to update password: ' + result.error);
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
};
</script>

<template>
    <div class="min-h-screen p-4">
        <RouterLink to="/settings" class="absolute left-2 top-2">
            <Undo2 class="w-6 h-6 text-purple" />
        </RouterLink>
        <div class="flex flex-col gap-6 mt-12 max-w-md mx-auto">
            <div>
                <h1 class="font-bold text-2xl mb-2">Modify Your Profile</h1>
                <p class="text-gray-600 mb-6">
                    Update your personal information section by section.
                </p>
            </div>

            <!-- Section Username -->
            <TheModifyInput
                name="pseudo"
                label="Username"
                type="text"
                v-model="profile.pseudo"
                @update:modelValue="(val) => { profile.pseudo = val; store.commit('setPseudo', val); }"
            />

            <!-- Section Email -->
            <TheModifyInput
                name="email"
                label="Email"
                type="email"
                v-model="profile.email"
                @update:modelValue="(val) => { profile.email = val; }"
            />

            <div class="bg-white border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="font-semibold text-lg">Password</h2>
                    <button v-if="!editingPassword" @click="startEditPassword" 
                        class="text-purple hover:text-purple-dark transition">
                        <Edit2 class="w-5 h-5" />
                    </button>
                </div>
                <div v-if="!editingPassword">
                    <p class="text-gray-700">••••••••</p>
                </div>
                <div v-else class="flex flex-col gap-2">
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
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>