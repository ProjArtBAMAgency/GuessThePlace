<script setup>
import { ref, onMounted } from 'vue';
import { getProfile } from '@/hooks/getProfile';
import  TheModifyPassword from '@/components/form/TheModifyPassword.vue';
import TheDeleteAccountForm from '@/components/form/TheDeleteAccountForm.vue';
import { Undo2 } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';
import TheModifyInput from '@/components/form/TheModifyInput.vue';
import { store } from '@/store/store.js';

const profile = ref({ pseudo: '', email: '' });
const error = ref(null);
const loading = ref(true);


onMounted(async () => {
    const profileData = await getProfile();
    profile.value = {
        pseudo: profileData?.pseudo ?? '',
        email: profileData?.email ?? '',
    };
    error.value = profileData?.error ?? null;
    loading.value = profileData?.loading ?? false;
    
    console.log('Profile data:', profileData);
});


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
                v-if="!loading"
                name="pseudo"
                label="Username"
                type="text"
                v-model="profile.pseudo"
                @update:modelValue="(val) => { profile.pseudo = val; store.commit('setPseudo', val); }"
            />

            <!-- Section Email -->
            <TheModifyInput
                v-if="!loading"
                name="email"
                label="Email"
                type="email"
                v-model="profile.email"
                @update:modelValue="(val) => { profile.email = val; }"
            />
            <div class="mb-28">
            <TheModifyPassword 
                v-if="!loading"
            />
            </div>
            <div class="mt-12">
                <TheDeleteAccountForm />
            </div>
        </div>
    </div>
</template>

<style scoped></style>