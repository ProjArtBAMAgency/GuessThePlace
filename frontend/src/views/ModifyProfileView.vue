<script setup>
import { ref, onMounted } from 'vue';
import { getProfile } from '@/hooks/getProfile';
import TheTextInput from '@/components/form/TheTextInput.vue';
import { patchProfile } from '@/hooks/patchProfile';
import { Undo2, Edit2, Check, X } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';
import { store } from '@/store/store.js';

const profile = ref({});
const error = ref(null);
const loading = ref(true);

// États d'édition pour chaque section
const editingPseudo = ref(false);
const editingEmail = ref(false);
const editingPassword = ref(false);

// Valeurs temporaires pour l'édition - initialisées avec des chaînes vides
const tempPseudo = ref('');
const tempEmail = ref('');
const tempPassword = ref('');
const tempConfirmPassword = ref('');

onMounted(async () => {
    const profileData = await getProfile();
    profile.value = profileData;
    error.value = profileData.error;
    loading.value = profileData.loading;
    
    // Initialiser les valeurs temporaires
    tempPseudo.value = profileData.pseudo || '';
    tempEmail.value = profileData.email || '';
    
    console.log('Profile data:', profileData);
});

// Fonctions pour activer l'édition
const startEditPseudo = () => {
    tempPseudo.value = profile.value.pseudo || '';
    editingPseudo.value = true;
};

const startEditEmail = () => {
    tempEmail.value = profile.value.email || '';
    editingEmail.value = true;
};

const startEditPassword = () => {
    tempPassword.value = '';
    tempConfirmPassword.value = '';
    editingPassword.value = true;
};

// Fonctions pour sauvegarder
const savePseudo = async () => {
    const result = await patchProfile({ pseudo: tempPseudo.value });
    if (result.error) {
        alert('Failed to update username: ' + result.error);
        return;
    }
    profile.value.pseudo = tempPseudo.value;
    store.commit('setPseudo', tempPseudo.value);
    editingPseudo.value = false;
};

const saveEmail = async () => {
    const result = await patchProfile({ email: tempEmail.value });
    if (result.error) {
        alert('Failed to update email: ' + result.error);
        return;
    }
    profile.value.email = tempEmail.value;
    editingEmail.value = false;
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

// Fonctions pour annuler
const cancelEditPseudo = () => {
    editingPseudo.value = false;
    tempPseudo.value = '';
};

const cancelEditEmail = () => {
    editingEmail.value = false;
    tempEmail.value = '';
};

const cancelEditPassword = () => {
    editingPassword.value = false;
    tempPassword.value = '';
    tempConfirmPassword.value = '';
};
</script>

<template>
    <div class="container p-4">
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
            <div class="bg-white border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="font-semibold text-lg">Username</h2>
                    <button v-if="!editingPseudo" @click="startEditPseudo" 
                        class="text-purple hover:text-purple-dark transition">
                        <Edit2 class="w-5 h-5" />
                    </button>
                </div>
                <div v-if="!editingPseudo">
                    <p class="text-gray-700">{{ profile.pseudo }}</p>
                </div>
                <div v-else class="flex flex-col gap-2">
                    <TheTextInput id="edit-pseudo" label="Username" v-model="tempPseudo" />
                    <div class="flex gap-2">
                        <button @click="savePseudo" 
                            class="flex items-center gap-1 bg-purple text-white px-3 py-1 rounded hover:bg-purple-dark transition">
                            <Check class="w-4 h-4" /> Save
                        </button>
                        <button @click="cancelEditPseudo" 
                            class="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition">
                            <X class="w-4 h-4" /> Cancel
                        </button>
                    </div>
                </div>
            </div>

            <!-- Section Email -->
            <div class="bg-white border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="font-semibold text-lg">Email</h2>
                    <button v-if="!editingEmail" @click="startEditEmail" 
                        class="text-purple hover:text-purple-dark transition">
                        <Edit2 class="w-5 h-5" />
                    </button>
                </div>
                <div v-if="!editingEmail">
                    <p class="text-gray-700">{{ profile.email }}</p>
                </div>
                <div v-else class="flex flex-col gap-2">
                    <TheTextInput id="edit-email" label="Email" v-model="tempEmail" type="email" />
                    <div class="flex gap-2">
                        <button @click="saveEmail" 
                            class="flex items-center gap-1 bg-purple text-white px-3 py-1 rounded hover:bg-purple-dark transition">
                            <Check class="w-4 h-4" /> Save
                        </button>
                        <button @click="cancelEditEmail" 
                            class="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition">
                            <X class="w-4 h-4" /> Cancel
                        </button>
                    </div>
                </div>
            </div>

            <!-- Section Password -->
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